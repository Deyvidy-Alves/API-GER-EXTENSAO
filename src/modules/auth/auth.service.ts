import { prisma } from '../../lib/prisma.js'
import { type RegisterDTO, type LoginDTO } from './auth.schema.js'
import jwt from 'jsonwebtoken';
import { getEnv } from '../../utils/getEnv.js';
import bcrypt from 'bcrypt'



export class AuthService {
  static async register(data: RegisterDTO) {
    const userExists = await prisma.user.findUnique({ where: {email: data.email } });

    if (userExists) {
      throw new Error('Email ja cadastrado.');
    }

    const passwordHash = await bcrypt.hash(data.senha, 10);

    const user = await prisma.user.create({
      data: {
        nome: data.nome,
        email: data.email,
        senhaHash: passwordHash,
        instituicaoId: data.instituicaoId,
        papeis: {
          create: {
            papel: {
              connect: { nome: 'ALUNO' } //apenas aluno usa a rota publica registro para se cadastrar
            }
          }
        }
      },
      select: {
        id: true, 
        nome: true,
        email: true,
        createdAt: true
      }
    });

    return user;
  }

  static async login(data: LoginDTO) {
    //verificar se o usuario existe
    const user = await prisma.user.findUnique({
      where: {email: data.email},
      include: {
        papeis: {
          include: {
            papel: {
              include: {
                permissoes: {
                  include: {
                    permissao: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!user) {
      throw new Error('Email ou senha inválidos!');
    }

    //verificar se a senha esta correta
    const isPasswordMatches = await bcrypt.compare(data.senha, user.senhaHash);

    if (!isPasswordMatches) {
      throw new Error('Email ou senha inválidos');
    }

    // montar a carga do token
    const roles = user.papeis.map(userPapel => userPapel.papel.nome); //pega o nome de cada papel

    /*
    Pega todos os papéis do usuário, pega todas as permissões desses papéis, transforma em strings tipo recurso:acao e junta tudo num único array.
    */
    const permissions = user.papeis.flatMap(userPapel => 
      userPapel.papel.permissoes.map(pp => `${pp.permissao.recurso}:${pp.permissao.acao}`)
    );

    const payload = {
      sub: user.id, //sub -> subject 
      name: user.nome,
      email: user.email,
      roles,
      permissions
    }

    //gerar token
    const token = jwt.sign(payload, getEnv('JWT_SECRET'), {
      expiresIn: '7d',
    })
    return { token };
  }
}
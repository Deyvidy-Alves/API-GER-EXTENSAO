import { prisma } from '../../lib/prisma.js'
import { type RegisterDTO, type LoginDTO, type ForgotPasswordDTO, type ResetPasswordDTO } from './auth.schema.js'
import jwt from 'jsonwebtoken';
import { getEnv } from '../../utils/getEnv.js';
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import { hashToken } from '../../utils/hashToken.js';
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

  static async forgotPassword(data: ForgotPasswordDTO) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });

    if (!user) {
      return { message: 'Se o email existir, você receberá instruções de recuperação.' };
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(rawToken);

    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hora

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt
      }
    });

    return {
      message: 'Se o email existir, você receberá instruções de recuperação.',
      ...(process.env.NODE_ENV !== 'production' ? { token: rawToken } : {})
    };
  }

  static async resetPassword(data: ResetPasswordDTO) {
    const tokenHash = hashToken(data.token); // o usuário manda o token cru, você faz o hash pra buscar

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash }
    });

    if (!resetToken) {
      throw new Error('Token inválido.');
    }

    if (resetToken.used) {
      throw new Error('Token já utilizado.');
    }

    if (resetToken.expiresAt < new Date()) {
      throw new Error('Token expirado.');
    }

    const senhaHash = await bcrypt.hash(data.novaSenha, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { senhaHash }
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true }
      })
    ]);

    return { message: 'Senha redefinida com sucesso.' };
  }
  
}
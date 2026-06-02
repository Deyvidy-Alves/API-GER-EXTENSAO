import { prisma } from '../../lib/prisma.js'
import { type RegisterDTO } from './auth.schema.js'
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
}
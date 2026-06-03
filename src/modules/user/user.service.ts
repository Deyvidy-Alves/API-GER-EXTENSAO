import { prisma } from '../../lib/prisma.js';
import { type CreateUserDTO, type UpdateUserDTO } from './user.schema.js';
import bcrypt from 'bcrypt';

export class UserService {
  static async create(data: CreateUserDTO) {
    const userExists = await prisma.user.findUnique({ where: { email: data.email }});

    if (userExists) {
      throw new Error('Email já cadastrado.');
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
              connect: { nome: data.papel }
            }
          }
        }
      },
      select: {
        id: true, 
        email: true, 
        createdAt: true,
        papeis: {
          select: {
            papel: { select: { nome: true }}
          }
        }
      }
    });
    return user;
  }
}
import { prisma } from '../../lib/prisma.js'
import { type RegisterDTO, type LoginDTO, type ForgotPasswordDTO, type ResetPasswordDTO, type RefreshTokenDTO, type LogoutDTO } from './auth.schema.js'
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

    const cpfExists = await prisma.user.findUnique({ where: { cpf: data.cpf } });
    if (cpfExists) {
      throw new Error('CPF já cadastrado.');
    }

    const passwordHash = await bcrypt.hash(data.senha, 10);

    const user = await prisma.user.create({
      data: {
        nome: data.nome,
        email: data.email,
        cpf: data.cpf,
        senhaHash: passwordHash,
        instituicaoId: data.instituicaoId,
        papeis: {
          create: { papel: { connect: { nome: 'ALUNO' } } }
        }
      },
      select: { id: true, nome: true, email: true, createdAt: true }
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


    const accessToken = jwt.sign(payload, getEnv('JWT_SECRET'), {
      expiresIn: '15m',
    });

    const rawRefreshToken = crypto.randomBytes(40).toString('hex');
    const refreshHashToken = hashToken(rawRefreshToken);
    const refreshTokenExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); //7 dias

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: refreshHashToken,
        expiresAt: refreshTokenExpiresAt
      }
    });

    return { accessToken, refreshToken: rawRefreshToken };
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
    const tokenHash = hashToken(data.token); 

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

  static async refresh(data: RefreshTokenDTO) {
    const tokenHash = hashToken(data.refreshToken);

    const stored = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          include: {
            papeis: {
              include: {
                papel: { include: { permissoes: { include: { permissao: true } } } }
              }
            }
          }
        }
      }
    });

    if (!stored) throw new Error('Refresh token inválido.');
    if (stored.revoked) throw new Error('Refresh token revogado.');
    if (stored.expiresAt < new Date()) throw new Error('Refresh token expirado.');

    const roles = stored.user.papeis.map(userPapel => userPapel.papel.nome);
    const permissions = stored.user.papeis.flatMap(userPapel =>
      userPapel.papel.permissoes.map(pp => `${pp.permissao.recurso}:${pp.permissao.acao}`)
    );

    const accessToken = jwt.sign({
      sub: stored.user.id,
      name: stored.user.nome,
      email: stored.user.email,
      roles,
      permissions
    }, getEnv('JWT_SECRET'), { expiresIn: '15m' });

    return { accessToken };
  }

  static async logout(data: LogoutDTO) {
    const tokenHash = hashToken(data.refreshToken);

    const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } });

    if (!stored) {
      return { message: 'Logout realizado.' };
    }

    await prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revoked: true }
    });

    return { message: 'Logout realizado.' };
  }
  
}
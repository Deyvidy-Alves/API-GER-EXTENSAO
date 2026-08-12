import { prisma } from "../../lib/prisma.js";
import { createUserWithStaffProfile } from "../../utils/usersAndProfiles/createUserWithStaffProfile.js";
import { AppError } from "../../utils/AppError.js";

export class DeppiService {
  static async list() {
    const users = await prisma.user.findMany({
      where: {
        papeis: {
          some: {
            papel: {
              nome: "DEPPI",
            },
          },
        },
      },
      include: {
        papeis: {
          include: {
            papel: true,
          },
        },
        perfilServidor: true,
        instituicao: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return users.map((user) => ({
      id: user.id,
      nome: user.nome,
      email: user.email,
      ativo: user.ativo,
      instituicaoId: user.instituicaoId,
      instituicao: user.instituicao,
      perfilServidor: user.perfilServidor,
      roles: user.papeis.map((p) => p.papel.nome),
    }));
  }

  static async getById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        papeis: {
          include: {
            papel: true,
          },
        },
        perfilServidor: true,
        instituicao: true,
      },
    });

    if (!user) {
      throw new AppError("Usuário DEPPI não encontrado.", 404);
    }

    const isDeppi = user.papeis.some((p) => p.papel.nome === "DEPPI");
    if (!isDeppi) {
      throw new AppError("O usuário informado não é DEPPI.", 400);
    }

    return {
      id: user.id,
      nome: user.nome,
      email: user.email,
      ativo: user.ativo,
      instituicaoId: user.instituicaoId,
      instituicao: user.instituicao,
      perfilServidor: user.perfilServidor,
      roles: user.papeis.map((p) => p.papel.nome),
    };
  }

  static async create(data: any) {
    return createUserWithStaffProfile({
      nome: data.nome,
      email: data.email,
      senha: data.senha,
      instituicaoId: data.instituicaoId,
      papel: "DEPPI",
      perfilServidor: data.perfilServidor,
    });
  }

  static async update(id: string, data: any) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        papeis: { include: { papel: true } },
        perfilServidor: true,
      },
    });

    if (!user) {
      throw new AppError("Usuário DEPPI não encontrado.", 404);
    }

    const isDeppi = user.papeis.some((p) => p.papel.nome === "DEPPI");
    if (!isDeppi) {
      throw new AppError("O usuário informado não é DEPPI.", 400);
    }

    return prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id },
        data: {
          nome: data.nome,
          email: data.email,
          ativo: data.ativo,
        },
      });

      if (data.perfilServidor) {
        if (!user.perfilServidor) {
          throw new AppError("Perfil servidor não encontrado.", 404);
        }

        await tx.perfilServidor.update({
          where: { userId: id },
          data: data.perfilServidor,
        });
      }

      const refreshed = await tx.user.findUnique({
        where: { id },
        include: {
          papeis: { include: { papel: true } },
          perfilServidor: true,
          instituicao: true,
        },
      });

      if (!refreshed) {
        throw new AppError("Falha ao carregar dados atualizados.", 500);
      }

      return {
        id: refreshed.id,
        nome: refreshed.nome,
        email: refreshed.email,
        ativo: refreshed.ativo,
        instituicaoId: refreshed.instituicaoId,
        instituicao: refreshed.instituicao,
        perfilServidor: refreshed.perfilServidor,
        roles: refreshed.papeis.map((p) => p.papel.nome),
      };
    });
  }

  static async remove(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        papeis: { include: { papel: true } },
      },
    });

    if (!user) {
      throw new AppError("Usuário DEPPI não encontrado.", 404);
    }

    const isDeppi = user.papeis.some((p) => p.papel.nome === "DEPPI");
    if (!isDeppi) {
      throw new AppError("O usuário informado não é DEPPI.", 400);
    }

    await prisma.user.update({
      where: { id },
      data: { ativo: false },
    });

    return { message: "Usuário DEPPI desativado com sucesso." };
  }
}
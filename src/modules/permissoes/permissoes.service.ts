import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { type CreatePermissaoDTO } from "./permissoes.schema.js";

export class PermissoesService {
  // lista os papeis com suas permissoes
  static async listPapeis() {
    const papeis = await prisma.papel.findMany({
      include: {
        permissoes: { include: { permissao: true } },
      },
      orderBy: { nome: "asc" },
    });

    return papeis.map((papel) => ({
      id: papel.id,
      nome: papel.nome,
      permissoes: papel.permissoes.map((pp) => ({
        id: pp.permissao.id,
        recurso: pp.permissao.recurso,
        acao: pp.permissao.acao,
      })),
    }));
  }

  static async listPermissoes() {
    return prisma.permissao.findMany({
      orderBy: [{ recurso: "asc" }, { acao: "asc" }],
    });
  }

  static async createPermissao(data: CreatePermissaoDTO) {
    const exists = await prisma.permissao.findUnique({
      where: { recurso_acao: { recurso: data.recurso, acao: data.acao } },
    });

    if (exists) {
      throw new AppError("Esta permissão já existe.", 409);
    }

    return prisma.permissao.create({ data });
  }

  // vincula um papel a um usuario
  static async vincularPapel(userId: string, papelId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError("Usuário não encontrado.", 404);
    }

    const papel = await prisma.papel.findUnique({ where: { id: papelId } });
    if (!papel) {
      throw new AppError("Papel não encontrado.", 404);
    }

    const jaTem = await prisma.userPapel.findUnique({
      where: { userId_papelId: { userId, papelId } },
    });
    if (jaTem) {
      throw new AppError("Usuário já possui este papel.", 409);
    }

    await prisma.userPapel.create({ data: { userId, papelId } });

    return { message: "Papel vinculado com sucesso." };
  }

  static async desvincularPapel(userId: string, papelId: string) {
    const vinculo = await prisma.userPapel.findUnique({
      where: { userId_papelId: { userId, papelId } },
    });
    if (!vinculo) {
      throw new AppError("Vínculo não encontrado.", 404);
    }

    await prisma.userPapel.delete({
      where: { userId_papelId: { userId, papelId } },
    });

    return { message: "Papel desvinculado com sucesso." };
  }

  // vincula uma permissao a um papel
  static async vincularPermissao(papelId: string, permissaoId: string) {
    const papel = await prisma.papel.findUnique({ where: { id: papelId } });
    if (!papel) {
      throw new AppError("Papel não encontrado.", 404);
    }

    const permissao = await prisma.permissao.findUnique({ where: { id: permissaoId } });
    if (!permissao) {
      throw new AppError("Permissão não encontrada.", 404);
    }

    const jaTem = await prisma.papelPermissao.findUnique({
      where: { papelId_permissaoId: { papelId, permissaoId } },
    });
    if (jaTem) {
      throw new AppError("Papel já possui esta permissão.", 409);
    }

    await prisma.papelPermissao.create({ data: { papelId, permissaoId } });

    return { message: "Permissão vinculada com sucesso." };
  }

  static async desvincularPermissao(papelId: string, permissaoId: string) {
    const vinculo = await prisma.papelPermissao.findUnique({
      where: { papelId_permissaoId: { papelId, permissaoId } },
    });
    if (!vinculo) {
      throw new AppError("Vínculo não encontrado.", 404);
    }

    await prisma.papelPermissao.delete({
      where: { papelId_permissaoId: { papelId, permissaoId } },
    });

    return { message: "Permissão desvinculada com sucesso." };
  }
}

import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { type CreateInstituicaoDTO, type UpdateInstituicaoDTO } from "./instituicoes.schema.js";

// Remove chaves com valor undefined do objeto.
// Necessário por causa do exactOptionalPropertyTypes: true no tsconfig —
// o Prisma rejeita undefined explícito; o campo precisa estar ausente.
function stripUndefined(obj: object): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined)
  );
}

export class InstituicoesService {
  static async list() {
    return prisma.instituicao.findMany({
      include: {
        _count: { select: { usuarios: true, cursos: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getById(id: string) {
    const instituicao = await prisma.instituicao.findUnique({
      where: { id },
      include: {
        _count: { select: { usuarios: true, cursos: true } },
      },
    });

    if (!instituicao) {
      throw new AppError("Instituição não encontrada.", 404);
    }

    return instituicao;
  }

  static async create(data: CreateInstituicaoDTO) {
    const siglaExists = await prisma.instituicao.findUnique({
      where: { sigla: data.sigla },
    });

    if (siglaExists) {
      throw new AppError("Já existe uma instituição com esta sigla.", 409);
    }

    return prisma.instituicao.create({ data: stripUndefined(data) as any });
  }

  static async update(id: string, data: UpdateInstituicaoDTO) {
    await this.getById(id);

    if (data.sigla) {
      const siglaExists = await prisma.instituicao.findUnique({
        where: { sigla: data.sigla },
      });

      if (siglaExists && siglaExists.id !== id) {
        throw new AppError("Já existe uma instituição com esta sigla.", 409);
      }
    }

    return prisma.instituicao.update({
      where: { id },
      data: stripUndefined(data) as any,
    });
  }

  static async setAtivo(id: string, ativo: boolean) {
    await this.getById(id);

    return prisma.instituicao.update({
      where: { id },
      data: { ativo },
    });
  }

  static async remove(id: string) {
    const instituicao = await this.getById(id);

    // nao exclui se tiver usuarios ou cursos vinculados
    if (instituicao._count.usuarios > 0 || instituicao._count.cursos > 0) {
      throw new AppError(
        "Não é possível excluir: existem usuários ou cursos vinculados a esta instituição.",
        400
      );
    }

    await prisma.instituicao.delete({ where: { id } });

    return { message: "Instituição excluída com sucesso." };
  }
}

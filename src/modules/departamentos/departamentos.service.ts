import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import {
  type CreateDepartamentoDTO,
  type UpdateDepartamentoDTO,
  type ListDepartamentosQueryDTO,
} from "./departamentos.schema.js";

// Remove chaves com valor undefined do objeto.
// Necessário por causa do exactOptionalPropertyTypes: true no tsconfig —
// o Prisma rejeita undefined explícito; o campo precisa estar ausente.
function stripUndefined(obj: object): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined)
  );
}

export class DepartamentosService {
  static async list(filters: ListDepartamentosQueryDTO) {
    const where: Record<string, unknown> = {};

    // filtro por instituicao
    if (filters.instituicaoId) {
      where.instituicaoId = filters.instituicaoId;
    }

    return prisma.departamento.findMany({
      where: where as any,
      include: { instituicao: true },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getById(id: string) {
    const departamento = await prisma.departamento.findUnique({
      where: { id },
      include: { instituicao: true },
    });

    if (!departamento) {
      throw new AppError("Departamento não encontrado.", 404);
    }

    return departamento;
  }

  // confere se a instituicao existe antes de vincular
  private static async assertInstituicaoExists(instituicaoId: string) {
    const instituicao = await prisma.instituicao.findUnique({
      where: { id: instituicaoId },
    });

    if (!instituicao) {
      throw new AppError("Instituição não encontrada.", 404);
    }
  }

  static async create(data: CreateDepartamentoDTO) {
    await this.assertInstituicaoExists(data.instituicaoId);

    return prisma.departamento.create({ data: stripUndefined(data) as any });
  }

  static async update(id: string, data: UpdateDepartamentoDTO) {
    await this.getById(id);

    if (data.instituicaoId) {
      await this.assertInstituicaoExists(data.instituicaoId);
    }

    return prisma.departamento.update({
      where: { id },
      data: stripUndefined(data) as any,
    });
  }

  static async remove(id: string) {
    await this.getById(id);

    await prisma.departamento.delete({ where: { id } });

    return { message: "Departamento excluído com sucesso." };
  }
}

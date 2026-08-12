import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { type ListUsuariosQueryDTO, type UpdateUsuarioDTO } from "./usuarios.schema.js";

// Remove chaves com valor undefined do objeto.
// Necessário por causa do exactOptionalPropertyTypes: true no tsconfig —
// o Prisma rejeita undefined explícito; o campo precisa estar ausente.
function stripUndefined(obj: object): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined)
  );
}

// monta o retorno sem expor a senhaHash
function toPublic(user: any) {
  return {
    id: user.id,
    nome: user.nome,
    nomeUsual: user.nomeUsual,
    email: user.email,
    telefonesPessoais: user.telefonesPessoais,
    telefonesInstitucionais: user.telefonesInstitucionais,
    ativo: user.ativo,
    createdAt: user.createdAt,
    instituicaoId: user.instituicaoId,
    instituicao: user.instituicao,
    roles: user.papeis ? user.papeis.map((p: any) => p.papel.nome) : [],
  };
}

export class UsuariosService {
  static async list(filters: ListUsuariosQueryDTO) {
    const where: Record<string, unknown> = {};

    // busca por nome ou email
    if (filters.q) {
      where.OR = [
        { nome: { contains: filters.q } },
        { email: { contains: filters.q } },
      ];
    }

    // filtro por papel
    if (filters.papel) {
      where.papeis = { some: { papel: { nome: filters.papel } } };
    }

    // filtro por status
    if (filters.ativo) {
      where.ativo = filters.ativo === "true";
    }

    const users = await prisma.user.findMany({
      where: where as any,
      include: {
        papeis: { include: { papel: true } },
        instituicao: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return users.map(toPublic);
  }

  static async getById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        papeis: { include: { papel: true } },
        instituicao: true,
        perfilAluno: true,
        perfilServidor: true,
      },
    });

    if (!user) {
      throw new AppError("Usuário não encontrado.", 404);
    }

    return {
      ...toPublic(user),
      perfilAluno: user.perfilAluno,
      perfilServidor: user.perfilServidor,
    };
  }

  static async update(id: string, data: UpdateUsuarioDTO) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new AppError("Usuário não encontrado.", 404);
    }

    // evita email duplicado
    if (data.email && data.email !== user.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: data.email },
      });
      if (emailExists) {
        throw new AppError("Já existe um usuário com este email.", 409);
      }
    }

    await prisma.user.update({
      where: { id },
      data: stripUndefined(data) as any,
    });

    return this.getById(id);
  }

  static async remove(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new AppError("Usuário não encontrado.", 404);
    }

    // exclusao logica: so inativa a conta
    await prisma.user.update({
      where: { id },
      data: { ativo: false },
    });

    return { message: "Usuário excluído com sucesso." };
  }
}

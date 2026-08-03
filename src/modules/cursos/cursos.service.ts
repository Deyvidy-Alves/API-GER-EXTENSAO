import { prisma } from '../../lib/prisma.js';
import { type CreateCursoDTO, type UpdateCursoDTO, type ListCursosQueryDTO } from './cursos.schema.js';

// Remove chaves com valor undefined do objeto.
// Necessário por causa do exactOptionalPropertyTypes: true no tsconfig —
// o Prisma rejeita undefined explícito; o campo precisa estar ausente.
// Retorna Record<string, unknown> para que o TypeScript não infira os campos
// como `T | undefined` nos contextos where/data do Prisma — use `as any` no ponto de uso.
function stripUndefined(obj: object): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined)
  );
}

export class CursosService {
  // Busca o PerfilProfessor do usuário logado a partir do User.id (req.user.sub)
  // Caminho: User -> PerfilServidor -> PerfilProfessor
  private static async getPerfilProfessorByUserId(userId: string) {
    const perfilServidor = await prisma.perfilServidor.findUnique({
      where: { userId },
      include: { perfilProfessor: true },
    });

    if (!perfilServidor || !perfilServidor.perfilProfessor) {
      throw new Error('Usuário não possui um PerfilProfessor associado.');
    }

    return perfilServidor.perfilProfessor;
  }

  static async createCurso(userId: string, data: CreateCursoDTO) {
    const perfilProfessor = await this.getPerfilProfessorByUserId(userId);

    // Separa instituicaoId e professorId (FKs obrigatórias) dos demais campos,
    // que podem conter opcionais com undefined. stripUndefined garante que
    // esses campos opcionais não cheguem como undefined explícito ao Prisma.
    const { instituicaoId, ...rest } = data;
    const cleanRest = stripUndefined(rest);

    const curso = await prisma.cursoExtensao.create({
      data: {
        ...cleanRest,
        professorId: perfilProfessor.id,
        instituicaoId,
      } as any,
    });

    return curso;
  }

  static async listCursos(filters: ListCursosQueryDTO) {
    const cleanFilters = stripUndefined(filters);

    const cursos = await prisma.cursoExtensao.findMany({
      where: cleanFilters as any,
      orderBy: { createdAt: 'desc' },
    });

    return cursos;
  }

  static async findCursoById(id: string) {
    const curso = await prisma.cursoExtensao.findUnique({
      where: { id },
      include: {
        municipios: true,
        formasAvaliacao: true,
        formasDivulgacao: true,
        atividades: true,
        equipes: true,
        parcerias: true,
        orcamentos: true,
        professor: {
          select: {
            id: true,
            perfilServidor: {
              select: {
                user: {
                  select: { id: true, nome: true, email: true },
                },
              },
            },
          },
        },
      },
    });

    if (!curso) {
      throw new Error('Curso não encontrado.');
    }

    return curso;
  }

  // Garante que o curso existe e retorna o registro.
  private static async getCursoOrThrow(id: string) {
    const curso = await prisma.cursoExtensao.findUnique({ where: { id } });

    if (!curso) {
      throw new Error('Curso não encontrado.');
    }

    return curso;
  }

  // Verifica se o usuário logado pode gerenciar (editar/cancelar) o curso.
  // DEPPI pode sempre. PROFESSOR só se for o dono (professorId do curso).
  private static async assertCanManageCurso(userId: string, roles: string[], cursoProfessorId: string) {
    if (roles.includes('DEPPI')) {
      return;
    }

    if (roles.includes('PROFESSOR')) {
      const perfilProfessor = await this.getPerfilProfessorByUserId(userId);

      if (perfilProfessor.id === cursoProfessorId) {
        return;
      }

      throw new Error('Você não tem permissão para gerenciar este curso: não é o professor responsável.');
    }

    throw new Error('Você não tem permissão para gerenciar este curso.');
  }

  static async updateCurso(id: string, userId: string, roles: string[], data: UpdateCursoDTO) {
    const curso = await this.getCursoOrThrow(id);

    await this.assertCanManageCurso(userId, roles, curso.professorId);

    const cleanData = stripUndefined(data);

    const updated = await prisma.cursoExtensao.update({
      where: { id },
      data: cleanData as any,
    });

    return updated;
  }

  static async deleteCurso(id: string, userId: string, roles: string[]) {
    const curso = await this.getCursoOrThrow(id);

    await this.assertCanManageCurso(userId, roles, curso.professorId);

    const cancelado = await prisma.cursoExtensao.update({
      where: { id },
      data: { status: 'CANCELADO' },
    });

    return cancelado;
  }
  static async uploadImagem(id: string, file?: Express.Multer.File) {

    if (!file) {
        throw new Error("Imagem não enviada.");
    }

    const curso = await prisma.cursoExtensao.update({

        where: { id },

        data: {
            imagemCapa: `/uploads/cursos/${file.filename}`
        } as any,

    });

    return curso;
}
}
import { Prisma } from '../../../generated/prisma/client.js';
import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../errors/http-error.js';
import { type CreateSubDTO } from './inscricao.schema.js';

type StatusInscricao = 'PENDENTE' | 'APROVADA' | 'REJEITADA' | 'CANCELADA' | 'LISTA_ESPERA';

// Retry em conflito de serialização (Postgres: código P2034 no Prisma).
// Necessário porque isolationLevel Serializable pode abortar transações
// concorrentes que leem/escrevem o mesmo conjunto de linhas.
async function runSerializable<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>, retries = 3): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await prisma.$transaction<T>(fn, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (error: any) {
      const isSerializationConflict = error?.code === 'P2034';
      if (isSerializationConflict && attempt < retries) continue;
      throw error;
    }
  }
  throw new HttpError('Não foi possível concluir a operação, tente novamente', 409);
}

export class InscricaoService {
  static async create(data: CreateSubDTO, userId: string) {
    return runSerializable(async (tx) => {
      const profileStudent = await tx.perfilAluno.findUnique({ where: { userId } });
      if (!profileStudent) throw new HttpError('Usuário não possui perfil de aluno', 403);

      const course = await tx.cursoExtensao.findUnique({ where: { id: data.cursoId } });
      if (!course) throw new HttpError('Curso não encontrado', 404);
      if (course.status !== 'PUBLICADO') throw new HttpError('Curso não foi publicado.', 400);

      const isRegistered = await tx.inscricao.findUnique({
        where: {
          alunoId_cursoId: {
            alunoId: profileStudent.id,
            cursoId: data.cursoId,
          },
        },
      });
      if (isRegistered) throw new HttpError('Aluno já possui inscrição neste curso', 400);

      const totalAccepted = await tx.inscricao.count({
        where: { cursoId: data.cursoId, status: 'APROVADA' },
      });
      const status: StatusInscricao = totalAccepted >= course.maxBeneficiados ? 'LISTA_ESPERA' : 'PENDENTE';

      const sub = await tx.inscricao.create({
        data: { alunoId: profileStudent.id, cursoId: data.cursoId, status },
      });

      await tx.inscricaoHistorico.create({
        data: {
          inscricaoId: sub.id,
          alteradoPorId: userId,
          statusAnterior: status,
          statusNovo: status,
          observacao: 'Inscrição realizada por aluno',
        },
      });

      return sub;
    });
  }

  static async listByCourse(courseId: string, userId: string, roles: string[]) {
    const course = await prisma.cursoExtensao.findUnique({ where: { id: courseId } });
    if (!course) throw new HttpError('Curso não encontrado', 404);

    const isDeppi = roles.includes('DEPPI');

    if (!isDeppi) {
      const staffProfile = await prisma.perfilServidor.findUnique({ where: { userId } });
      const professorProfile = staffProfile
        ? await prisma.perfilProfessor.findUnique({ where: { perfilServidorId: staffProfile.id } })
        : null;

      if (!professorProfile || professorProfile.id !== course.professorId) {
        throw new HttpError('Você não tem permissão para ver as inscrições deste curso', 403);
      }
    }

    return prisma.inscricao.findMany({
      where: { cursoId: courseId },
      include: { aluno: true },
      orderBy: { inscricaoEm: 'desc' },
    });
  }

  static async listMine(userId: string) {
    const studentProfile = await prisma.perfilAluno.findUnique({ where: { userId } });
    if (!studentProfile) throw new HttpError('Usuário não possui perfil de aluno', 403);

    return prisma.inscricao.findMany({
      where: { alunoId: studentProfile.id },
      include: { curso: true },
      orderBy: { inscricaoEm: 'desc' },
    });
  }

  static async updateStatus(
    subId: string,
    newStatus: 'APROVADA' | 'REJEITADA' | 'CANCELADA' | 'LISTA_ESPERA',
    userId: string,
    roles: string[],
    observacao?: string
  ) {
    return runSerializable(async (tx) => {
      const sub = await tx.inscricao.findUnique({
        where: { id: subId },
        include: { curso: true },
      });
      if (!sub) throw new HttpError('Inscrição não encontrada', 404);

      const isDeppi = roles.includes('DEPPI');
      if (!isDeppi) {
        const staffProfile = await tx.perfilServidor.findUnique({ where: { userId } });
        const professorProfile = staffProfile
          ? await tx.perfilProfessor.findUnique({ where: { perfilServidorId: staffProfile.id } })
          : null;
        if (!professorProfile || professorProfile.id !== sub.curso.professorId) {
          throw new HttpError('Você não tem permissão para alterar esta inscrição', 403);
        }
      }

      if (sub.status === newStatus) {
        throw new HttpError(`Inscrição já está com status ${newStatus}`, 400);
      }

      if (newStatus === 'APROVADA') {
        const totalAceitas = await tx.inscricao.count({
          where: { cursoId: sub.cursoId, status: 'APROVADA' },
        });
        if (totalAceitas >= sub.curso.maxBeneficiados) {
          throw new HttpError('Não há vagas disponíveis para aprovar esta inscrição', 400);
        }
      }

      const statusAnterior = sub.status;

      const updated = await tx.inscricao.update({
        where: { id: subId },
        data: { status: newStatus },
      });

      await tx.inscricaoHistorico.create({
        data: {
          inscricaoId: subId,
          alteradoPorId: userId,
          statusAnterior,
          statusNovo: newStatus,
          observacao: observacao ?? `Status alterado para ${newStatus}`,
        },
      });

      // promoção automática da lista de espera: dispara sempre que uma vaga
      // é liberada, seja por cancelamento, rejeição OU remoção manual de aprovado
      const liberouVaga =
        (newStatus === 'CANCELADA' || newStatus === 'REJEITADA' || newStatus === 'LISTA_ESPERA') &&
        statusAnterior === 'APROVADA';

      if (liberouVaga) {
        const proximo = await tx.inscricao.findFirst({
          where: { cursoId: sub.cursoId, status: 'LISTA_ESPERA' },
          orderBy: { inscricaoEm: 'asc' },
        });

        if (proximo) {
          await tx.inscricao.update({
            where: { id: proximo.id },
            data: { status: 'PENDENTE' },
          });

          await tx.inscricaoHistorico.create({
            data: {
              inscricaoId: proximo.id,
              alteradoPorId: userId,
              statusAnterior: 'LISTA_ESPERA',
              statusNovo: 'PENDENTE',
              observacao: 'Promovido automaticamente da lista de espera (vaga liberada)',
            },
          });
        }
      }

      return updated;
    });
  }
}
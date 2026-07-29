import { ro } from 'zod/locales';
import { prisma } from '../../lib/prisma.js';
import { type CreateSubDTO } from './sub.schema.js';

export class SubService {
  static async create (data: CreateSubDTO, userId: string) {
    // verificar se usuario (aluno) existe
    const profileStudent = await prisma.perfilAluno.findUnique({ where: { userId } });
    if (!profileStudent) throw new Error('Usuário não possui perfil de aluno');

    //verificar se curso existe e se está publicado
    const course = await prisma.cursoExtensao.findUnique({ where: { id: data.cursoId } });
    if (!course) throw new Error('Curso não encontrado')
    if(course.status !== 'PUBLICADO') throw new Error('Curso não foi publicado.');

    //verifica inscrição duplicada
    const isRegistered = await prisma.inscricao.findUnique({
      where: {
        alunoId_cursoId: {
          alunoId: profileStudent.id,
          cursoId: data.cursoId,
        },
      },
    });

    if (isRegistered) throw new Error('Aluno já possui inscrição neste curso');

    //verificar vagas
    const totalAccepted = await prisma.inscricao.count({
      where: { cursoId: data.cursoId, status: 'APROVADA'}
    });
    const status = totalAccepted >= course.maxBeneficiados ? 'LISTA_ESPERA' : 'PENDENTE';

    /*return prisma.inscricao.create({
      data: { alunoId: profileStudent.id, cursoId: data.cursoId, status }
    })*/
    return prisma.$transaction(async (tx: any) => {
      const sub = await tx.inscricao.create({
        data: {
          alunoId: profileStudent.id,
          cursoId: data.cursoId,
          status,
        }
      });

      await tx.inscricaoHistorico.create({
        data: {
          inscricaoId: sub.id,
          alteradoPorId: userId,
          statusAnterior: status,
          statusNovo: status,
          observacao: 'Inscrição realizada por aluno'
        }
      });

      return sub;
    });
  }

  static async listByCourse(courseId: string, userId: string, roles: string[]) {
    const course = await prisma.cursoExtensao.findUnique({ where: { id: courseId } });
    if (!course) throw new Error('Curso não encontrado');
    
    const isDeppi = roles.includes('DEPPI');

    if (!isDeppi) {
      const staffProfile = await prisma.perfilServidor.findUnique({ where: { userId } });
      const professorProfile = staffProfile
        ? await prisma.perfilProfessor.findUnique({ where: { perfilServidorId: staffProfile.id } })
        : null;
      
      if (!professorProfile || professorProfile.id !== course.professorId) {
        throw new Error('Você não tem permissão para ver as inscrições deste curso');
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
    if (!studentProfile) throw new Error('Usuário não possui perfil de aluno');

    return prisma.inscricao.findMany({
      where: { alunoId: studentProfile.id },
      include: { curso: true },
      orderBy: { inscricaoEm: 'desc' },
    });
  }

  static async updateStatus(
    subId: string,
    newStatus: 'APROVADA' | 'REJEITADA' | 'CANCELADA',
    userId: string,
    roles: string[],
    observacao?: string
  ) {
    return prisma.$transaction(async (tx: any) => {
      const sub = await tx.inscricao.findUnique({
        where: { id: subId },
        include: { curso: true },
      });
      if (!sub) throw new Error('Inscrição não encontrada');

      // autorização: DEPPI ou professor dono do curso
      const isDeppi = roles.includes('DEPPI');
      if (!isDeppi) {
        const staffProfile = await tx.perfilServidor.findUnique({ where: { userId } });
        const professorProfile = staffProfile
          ? await tx.perfilProfessor.findUnique({ where: { perfilServidorId: staffProfile.id } })
          : null;
        if (!professorProfile || professorProfile.id !== sub.curso.professorId) {
          throw new Error('Você não tem permissão para alterar esta inscrição');
        }
      }

      // trava: impede transição pro mesmo status atual
      if (sub.status === newStatus) {
        throw new Error(`Inscrição já está com status ${newStatus}`);
      }

      // se for aprovar, checar vaga
      if (newStatus === 'APROVADA') {
        const totalAceitas = await tx.inscricao.count({
          where: { cursoId: sub.cursoId, status: 'APROVADA' },
        });
        if (totalAceitas >= sub.curso.maxBeneficiados) {
          throw new Error('Não há vagas disponíveis para aprovar esta inscrição');
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

      // promoção automática da lista de espera
      if ((newStatus === 'CANCELADA' || newStatus === 'REJEITADA') && statusAnterior === 'APROVADA') {
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
};
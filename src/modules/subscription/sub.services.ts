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
    })
  }
};
import { error } from 'node:console';
import { prisma } from '../../lib/prisma.js';
import { type StudentProfilelDTO } from './profile.schema.js';

export class ProfileService {
  static async upsertStudentProfile(userId: string, roles: string[], data: StudentProfilelDTO) {
    const isAluno = roles.includes('ALUNO');

    if (!isAluno) {
      throw new Error("Não é aluno!");
    }

    const exists = await prisma.perfilAluno.findUnique({ where: { userId } })

    const profile = await prisma.perfilAluno.upsert({
      where: { userId },
      update: {
        matricula: data.matricula,
        cursoGraduacao: data.cursoGraduacao,
        semestre: data.semestre ?? null,
      },
      create: {
        userId,
        matricula: data.matricula,
        cursoGraduacao: data.cursoGraduacao,
        semestre: data.semestre ?? null
      },
       select: {
        id: true,
        matricula: true,
        cursoGraduacao: true,
        semestre: true,
      }
    });
    return { profile, created: !exists };
  }
}
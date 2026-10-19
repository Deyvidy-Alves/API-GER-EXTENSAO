import bcrypt from 'bcrypt';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../utils/AppError.js';
import { type AtualizarPerfilDTO, type CriarProfessorDTO } from './professor.schema.js';

export class ProfessorService {
  // Cria um professor do zero: usuário + perfil servidor + perfil professor +
  // papel PROFESSOR, tudo numa única transação. Usado por DEPPI/ADMIN.
  static async criarProfessor(data: CriarProfessorDTO) {
    const emailExistente = await prisma.user.findUnique({ where: { email: data.email } });
    if (emailExistente) {
      throw new AppError('Já existe um usuário com este email.', 409);
    }

    const siapeExistente = await prisma.perfilServidor.findUnique({
      where: { siape: data.perfilServidor.siape },
    });
    if (siapeExistente) {
      throw new AppError('Já existe um servidor com este SIAPE.', 409);
    }

    const papelProfessor = await prisma.papel.findUnique({ where: { nome: 'PROFESSOR' } });
    if (!papelProfessor) {
      throw new AppError('Papel PROFESSOR não encontrado. Rode o seed.', 404);
    }

    const senhaHash = await bcrypt.hash(data.senha, 10);

    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          nome: data.nome,
          email: data.email,
          senhaHash,
          instituicaoId: data.instituicaoId,
          ativo: true,
          papeis: { create: { papelId: papelProfessor.id } },
        },
      });

      // `as any`: os opcionais do Zod chegam como `T | undefined`, que o Prisma
      // rejeita sob exactOptionalPropertyTypes (mesmo padrao ja usado no projeto).
      const perfilServidor = await tx.perfilServidor.create({
        data: {
          userId: user.id,
          ...data.perfilServidor,
        } as any,
      });

      const perfilProfessor = await tx.perfilProfessor.create({
        data: {
          perfilServidorId: perfilServidor.id,
          ...(data.perfilProfessor ?? {}),
        } as any,
      });

      return {
        id: user.id,
        nome: user.nome,
        email: user.email,
        ativo: user.ativo,
        instituicaoId: user.instituicaoId,
        perfilServidor: {
          ...perfilServidor,
          perfilProfessor,
        },
        roles: ['PROFESSOR'],
      };
    });
  }

  // busca o perfilProfessor a partir do userId do token
  private static async getPerfilProfessor(userId: string) {
    const perfilServidor = await prisma.perfilServidor.findUnique({
      where: { userId },
      include: { perfilProfessor: true },
    });

    if (!perfilServidor?.perfilProfessor) {
      throw new AppError('Perfil de professor não encontrado. Contate o DEPPI.', 404);
    }

    return perfilServidor.perfilProfessor;
  }

  static async getPerfil(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nome: true,
        nomeUsual: true,
        email: true,
        emailSiape: true,
        emailNotificacao: true,
        telefonesInstitucionais: true,
        telefonesPessoais: true,
        cpf: true,
        dataNascimento: true,
        sexo: true,
        estadoCivil: true,
        instituicao: { select: { id: true, nome: true } },
        perfilServidor: {
          select: {
            siape: true,
            matricula: true,
            setorSuap: true,
            cargo: true,
            regimeTrabalho: true,
            jornadaTrabalho: true,
            situacao: true,
            perfilProfessor: {
              select: {
                id: true,
                titulacao: true,
                departamento: true,
                nce: true,
                disciplinaIngresso: true,
              },
            },
          },
        },
      },
    });

    if (!user) throw new AppError('Usuário não encontrado.', 404);
    return user;
  }

  static async atualizarPerfil(userId: string, data: AtualizarPerfilDTO) {
    const perfilProfessor = await this.getPerfilProfessor(userId);

    const updateData = {
      ...(data.titulacao !== undefined ? { titulacao: data.titulacao } : {}),
      ...(data.departamento !== undefined ? { departamento: data.departamento } : {}),
      ...(data.nce !== undefined ? { nce: data.nce } : {}),
      ...(data.disciplinaIngresso !== undefined ? { disciplinaIngresso: data.disciplinaIngresso } : {}),
    };

    const atualizado = await prisma.perfilProfessor.update({
      where: { id: perfilProfessor.id },
      data: updateData,
      select: {
        id: true,
        titulacao: true,
        departamento: true,
        nce: true,
        disciplinaIngresso: true,
      },
    });

    return atualizado;
  }

  static async listarMeusCursos(userId: string) {
    const perfilProfessor = await this.getPerfilProfessor(userId);

    const cursos = await prisma.cursoExtensao.findMany({
      where: { professorId: perfilProfessor.id },
      select: {
        id: true,
        titulo: true,
        tipo: true,
        tipoAcao: true,
        status: true,
        cargaHoraria: true,
        dataInicio: true,
        dataFim: true,
        modeloOferta: true,
        _count: { select: { inscricoes: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return cursos;
  }

  static async detalharCurso(userId: string, cursoId: string) {
    const perfilProfessor = await this.getPerfilProfessor(userId);

    const curso = await prisma.cursoExtensao.findFirst({
      where: { id: cursoId, professorId: perfilProfessor.id },
      include: {
        inscricoes: { select: { status: true } },
        _count: { select: { inscricoes: true } },
      },
    });

    if (!curso) throw new AppError('Curso não encontrado.', 404);

    // agrupa as inscrições por status
    const inscricoesPorStatus = curso.inscricoes.reduce((acc, i) => {
      acc[i.status] = (acc[i.status] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const { inscricoes, ...resto } = curso;
    return { ...resto, inscricoesPorStatus };
  }

  static async listarInscricoesDoCurso(userId: string, cursoId: string) {
    const perfilProfessor = await this.getPerfilProfessor(userId);

    // garante que o curso pertence ao professor logado
    const curso = await prisma.cursoExtensao.findFirst({
      where: { id: cursoId, professorId: perfilProfessor.id },
      select: { id: true },
    });

    if (!curso) throw new AppError('Curso não encontrado.', 404);

    const inscricoes = await prisma.inscricao.findMany({
      where: { cursoId },
      select: {
        id: true,
        status: true,
        inscricaoEm: true,
        aluno: {
          select: {
            matricula: true,
            user: { select: { nome: true, email: true } },
          },
        },
      },
      orderBy: { inscricaoEm: 'asc' },
    });

    return inscricoes;
  }
}
import { prisma } from '../../lib/prisma.js';
import { type CriarCursoDTO, type AtualizarPerfilDTO } from './professor.schema.js';

export class ProfessorService {
  // busca o perfilProfessor a partir do userId do token
  private static async getPerfilProfessor(userId: string) {
    const perfilServidor = await prisma.perfilServidor.findUnique({
      where: { userId },
      include: { perfilProfessor: true },
    });

    if (!perfilServidor?.perfilProfessor) {
      throw new Error('Perfil de professor não encontrado. Contate o DEPPI.');
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

    if (!user) throw new Error('Usuário não encontrado.');
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

  static async criarCurso(userId: string, data: CriarCursoDTO) {
    const perfilProfessor = await this.getPerfilProfessor(userId);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { instituicaoId: true },
    });

    if (!user) throw new Error('Usuário não encontrado.');

    const curso = await prisma.cursoExtensao.create({
      data: {
        titulo: data.titulo,
        tipoAcao: data.tipoAcao,
        tipo: data.tipo,
        areaTematica: data.areaTematica,
        linhaExtensao: data.linhaExtensao,
        localAtuacao: data.localAtuacao,
        modeloOferta: data.modeloOferta,
        cargaHoraria: data.cargaHoraria,
        dataInicio: data.dataInicio,
        dataFim: data.dataFim,
        minBeneficiados: data.minBeneficiados,
        maxBeneficiados: data.maxBeneficiados,
        fomento: data.fomento ?? null,
        programaInstitucional: data.programaInstitucional,
        apresentacao: data.apresentacao,
        justificativa: data.justificativa,
        publicoAlvo: data.publicoAlvo,
        objetivoGeral: data.objetivoGeral,
        objetivosEspecificos: data.objetivosEspecificos,
        metodologia: data.metodologia,
        professorId: perfilProfessor.id,
        instituicaoId: user.instituicaoId,
      },
    });

    return curso;
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

    if (!curso) throw new Error('Curso não encontrado.');

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

    if (!curso) throw new Error('Curso não encontrado.');

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

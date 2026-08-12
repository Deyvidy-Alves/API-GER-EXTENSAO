import { AppError } from '../../utils/AppError.js';
import { prisma } from '../../lib/prisma.js';
import { type StudentProfilelDTO, type TelefoneDTO, type EnderecoDTO } from './profile.schema.js';

export class ProfileService {
  // ─── PERFIL ALUNO (existente) ────────────────────────────────────────────────
  static async upsertStudentProfile(userId: string, roles: string[], data: StudentProfilelDTO) {
    const isAluno = roles.includes('ALUNO');

    if (!isAluno) {
      throw new AppError("Não é aluno!", 400);
    }

    const exists = await prisma.perfilAluno.findUnique({ where: { userId } });

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
        semestre: data.semestre ?? null,
      },
      select: {
        id: true,
        matricula: true,
        cursoGraduacao: true,
        semestre: true,
      },
    });

    return { profile, created: !exists };
  }

  // ─── BUSCAR PERFIL ───────────────────────────────────────────────────────────
  // Retorna dados diferentes dependendo do papel do usuário logado.
  static async getProfile(userId: string, roles: string[]) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nome: true,
        nomeUsual: true,
        email: true,
        fotoPerfil: true,
        telefonesInstitucionais: true,
        telefonesPessoais: true,
        endereco: true,
        numero: true,
        bairro: true,
        complemento: true,
        cep: true,
        cidade: true,
        perfilAluno: roles.includes('ALUNO') ? {
          select: {
            matricula: true,
            cursoGraduacao: true,
            semestre: true,
          },
        } : false,
        perfilServidor: (roles.includes('PROFESSOR') || roles.includes('DEPPI')) ? {
          include: { perfilProfessor: roles.includes('PROFESSOR') },
        } : false,
      },
    });

    if (!user) throw new AppError('Usuário não encontrado.', 404);

    // Telefones são armazenados como JSON string — converte para array na resposta
    return {
      ...user,
      telefonesInstitucionais: user.telefonesInstitucionais
        ? JSON.parse(user.telefonesInstitucionais)
        : [],
      telefonesPessoais: user.telefonesPessoais
        ? JSON.parse(user.telefonesPessoais)
        : [],
    };
  }

  // ─── FOTO ────────────────────────────────────────────────────────────────────
  static async saveFoto(userId: string, file?: Express.Multer.File) {
    if (!file) throw new AppError('Foto não enviada.', 400);

    const user = await prisma.user.update({
      where: { id: userId },
      data: { fotoPerfil: `/uploads/perfil/${file.filename}` } as any,
      select: { id: true, nome: true, fotoPerfil: true },
    });

    return user;
  }

  // ─── TELEFONE ────────────────────────────────────────────────────────────────
  // Telefones são arrays no body mas salvos como JSON string no banco.
  static async updateTelefone(userId: string, data: TelefoneDTO) {
    const updateData: Record<string, string | null> = {};

    if (data.telefonesInstitucionais !== undefined) {
      updateData.telefonesInstitucionais = JSON.stringify(data.telefonesInstitucionais);
    }
    if (data.telefonesPessoais !== undefined) {
      updateData.telefonesPessoais = JSON.stringify(data.telefonesPessoais);
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData as any,
      select: {
        id: true,
        telefonesInstitucionais: true,
        telefonesPessoais: true,
      },
    });

    // Converte de volta para array na resposta
    return {
      ...user,
      telefonesInstitucionais: user.telefonesInstitucionais
        ? JSON.parse(user.telefonesInstitucionais)
        : [],
      telefonesPessoais: user.telefonesPessoais
        ? JSON.parse(user.telefonesPessoais)
        : [],
    };
  }

  // ─── ENDEREÇO ────────────────────────────────────────────────────────────────
  static async updateEndereco(userId: string, data: EnderecoDTO) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: data as any,
      select: {
        id: true,
        endereco: true,
        numero: true,
        bairro: true,
        complemento: true,
        cep: true,
        cidade: true,
      },
    });

    return user;
  }
}
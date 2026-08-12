import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma.js";

type StaffProfileData = {
  siape: string;
  matricula?: string;
  setorSuap?: string;
  lotacaoSiape?: string;
  exercicioSiape?: string;
  situacao?: "ATIVO" | "INATIVO" | "APOSENTADO" | "CEDIDO" | "AFASTADO";
  regimeTrabalho?: "DEDICACAO_EXCLUSIVA" | "QUARENTA_HORAS" | "VINTE_HORAS";
  jornadaTrabalho?: "INTEGRAL" | "PARCIAL" | "NOTURNO";
  operaRaioX?: boolean;
  inicioServicoPublico?: Date;
  dataPosseInstituicao?: Date;
  inicioExercicioInstituicao?: Date;
  dataPosseCargo?: Date;
  inicioExercicioCargo?: Date;
  cargo?: string;
  classeCargo?: string;
  padrao?: string;
  grupoCargo?: string;
  codigoVaga?: string;
  banco?: string;
  agencia?: string;
  contaCorrente?: string;
};

type ProfessorProfileData = {
  titulacao?: string;
  departamento?: string;
  nce?: string;
  disciplinaIngresso?: string;
};

type CreateUserWithStaffProfileInput = {
  nome: string;
  email: string;
  senha: string;
  instituicaoId: string;
  papel: "DEPPI" | "PROFESSOR";
  perfilServidor: StaffProfileData;
  perfilProfessor?: ProfessorProfileData;
};

export async function createUserWithStaffProfile(
  input: CreateUserWithStaffProfileInput
) {
  const {
    nome,
    email,
    senha,
    instituicaoId,
    papel,
    perfilServidor,
    perfilProfessor,
  } = input;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("Já existe um usuário com este email.");
  }

  const role = await prisma.papel.findUnique({
    where: {
      nome: papel,
    },
  });

  if (!role) {
    throw new Error(`Papel "${papel}" não encontrado.`);
  }

  const passwordHash = await bcrypt.hash(senha, 10);

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        nome,
        email,
        senhaHash: passwordHash,
        instituicaoId,
        ativo: true,
        papeis: {
          create: {
            papelId: role.id,
          },
        },
      },
    });

    const servidor = await tx.perfilServidor.create({
      data: {
        userId: user.id,
        ...perfilServidor,
      },
    });

    let professor = null;

    if (papel === "PROFESSOR") {
      professor = await tx.perfilProfessor.create({
        data: {
          perfilServidorId: servidor.id,
          titulacao: perfilProfessor?.titulacao ?? null,
          departamento: perfilProfessor?.departamento ?? null,
          nce: perfilProfessor?.nce ?? null,
          disciplinaIngresso: perfilProfessor?.disciplinaIngresso ?? null,
        },
      });
    }

    return {
      id: user.id,
      nome: user.nome,
      email: user.email,
      ativo: user.ativo,
      instituicaoId: user.instituicaoId,
      perfilServidor: servidor,
      perfilProfessor: professor,
      roles: [papel],
    };
  });
}
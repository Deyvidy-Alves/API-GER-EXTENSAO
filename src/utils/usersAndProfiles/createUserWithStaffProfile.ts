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

export async function createUserWithStaffProfile(input: {
  nome: string;
  email: string;
  senha: string;
  instituicaoId: string;
  papel: "DEPPI" | "PROFESSOR";
  perfilServidor: StaffProfileData;
}) {
  const { nome, email, senha, instituicaoId, papel, perfilServidor } = input;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("Já existe um usuário com este email.");
  }

  const papelDb = await prisma.papel.findUnique({ where: { nome: papel } });
  if (!papelDb) {
    throw new Error(`Papel ${papel} não encontrado.`);
  }

  const senhaHash = await bcrypt.hash(senha, 10);

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        nome,
        email,
        senhaHash,
        instituicaoId,
        ativo: true,
        papeis: {
          create: {
            papelId: papelDb.id,
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

    return {
      id: user.id,
      nome: user.nome,
      email: user.email,
      ativo: user.ativo,
      instituicaoId: user.instituicaoId,
      perfilServidor: servidor,
      roles: [papel],
    };
  });
}
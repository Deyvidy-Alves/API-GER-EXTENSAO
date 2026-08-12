import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma.js";

import type {
  createDeppiSchema,
  perfilServidorSchema,
} from "../../modules/deppi/deppi.schema.js";

type StaffProfileData = {
  siape: string;
  matricula?: string | undefined;
  setorSuap?: string | undefined;
  lotacaoSiape?: string | undefined;
  exercicioSiape?: string | undefined;

  situacao?:
    | "ATIVO"
    | "INATIVO"
    | "APOSENTADO"
    | "CEDIDO"
    | "AFASTADO"
    | undefined;

  regimeTrabalho?:
    | "DEDICACAO_EXCLUSIVA"
    | "QUARENTA_HORAS"
    | "VINTE_HORAS"
    | undefined;

  jornadaTrabalho?:
    | "INTEGRAL"
    | "PARCIAL"
    | "NOTURNO"
    | undefined;

  operaRaioX?: boolean | undefined;

  inicioServicoPublico?: Date | undefined;
  dataPosseInstituicao?: Date | undefined;
  inicioExercicioInstituicao?: Date | undefined;
  dataPosseCargo?: Date | undefined;
  inicioExercicioCargo?: Date | undefined;

  cargo?: string | undefined;
  classeCargo?: string | undefined;
  padrao?: string | undefined;
  grupoCargo?: string | undefined;
  codigoVaga?: string | undefined;
  banco?: string | undefined;
  agencia?: string | undefined;
  contaCorrente?: string | undefined;
};

type ProfessorProfileData = {
  titulacao?: string | undefined;
  departamento?: string | undefined;
  nce?: string | undefined;
  disciplinaIngresso?: string | undefined;
};

type CreateUserWithStaffProfileInput = {
  nome: string;
  email: string;
  senha: string;
  instituicaoId: string;
  papel: "DEPPI" | "PROFESSOR";
  perfilServidor: StaffProfileData;
  perfilProfessor?: ProfessorProfileData | undefined;
};

function removeUndefined<T extends object>(
  object: T
): Partial<T> {
  return Object.fromEntries(
    Object.entries(object).filter(
      ([, value]) => value !== undefined
    )
  ) as Partial<T>;
}

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
    where: {
      email,
    },
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

    const perfilServidorData =
      removeUndefined(perfilServidor);

    const servidor =
      await tx.perfilServidor.create({
        data: {
          userId: user.id,

          siape: perfilServidorData.siape!,

          matricula:
            perfilServidorData.matricula ?? null,

          setorSuap:
            perfilServidorData.setorSuap ?? null,

          lotacaoSiape:
            perfilServidorData.lotacaoSiape ?? null,

          exercicioSiape:
            perfilServidorData.exercicioSiape ?? null,

          situacao:
            perfilServidorData.situacao ?? null,

          regimeTrabalho:
            perfilServidorData.regimeTrabalho ?? null,

          jornadaTrabalho:
            perfilServidorData.jornadaTrabalho ?? null,

          operaRaioX:
            perfilServidorData.operaRaioX ?? false,

          inicioServicoPublico:
            perfilServidorData.inicioServicoPublico ?? null,

          dataPosseInstituicao:
            perfilServidorData.dataPosseInstituicao ?? null,

          inicioExercicioInstituicao:
            perfilServidorData.inicioExercicioInstituicao ?? null,

          dataPosseCargo:
            perfilServidorData.dataPosseCargo ?? null,

          inicioExercicioCargo:
            perfilServidorData.inicioExercicioCargo ?? null,

          cargo:
            perfilServidorData.cargo ?? null,

          classeCargo:
            perfilServidorData.classeCargo ?? null,

          padrao:
            perfilServidorData.padrao ?? null,

          grupoCargo:
            perfilServidorData.grupoCargo ?? null,

          codigoVaga:
            perfilServidorData.codigoVaga ?? null,

          banco:
            perfilServidorData.banco ?? null,

          agencia:
            perfilServidorData.agencia ?? null,

          contaCorrente:
            perfilServidorData.contaCorrente ?? null,
        },
      });

    let professor = null;

    if (papel === "PROFESSOR") {
      professor =
        await tx.perfilProfessor.create({
          data: {
            perfilServidorId: servidor.id,

            titulacao:
              perfilProfessor?.titulacao ?? null,

            departamento:
              perfilProfessor?.departamento ?? null,

            nce:
              perfilProfessor?.nce ?? null,

            disciplinaIngresso:
              perfilProfessor?.disciplinaIngresso ?? null,
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
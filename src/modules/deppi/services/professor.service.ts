import { prisma } from "../../../lib/prisma.js";
import { createUserWithStaffProfile } from "../../../utils/usersAndProfiles/createUserWithStaffProfile.js";

type UpdateProfessorDTO = {
  nome: string;
  email: string;
  ativo: boolean;
  perfilServidor?: {
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
  perfilProfessor?: {
    titulacao?: string;
    departamento?: string;
    nce?: string;
    disciplinaIngresso?: string;
  };
};

export class ProfessorService {
  static async list() {
    const users = await prisma.user.findMany({
      where: {
        papeis: {
          some: {
            papel: {
              nome: "PROFESSOR",
            },
          },
        },
      },
      include: {
        instituicao: true,
        perfilServidor: {
          include: {
            perfilProfessor: true,
          },
        },
        papeis: {
          include: {
            papel: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return users.map((user) => ({
      id: user.id,
      nome: user.nome,
      email: user.email,
      ativo: user.ativo,

      instituicao: user.instituicao,

      perfilServidor: user.perfilServidor,

      perfilProfessor: user.perfilServidor?.perfilProfessor ?? null,

      roles: user.papeis.map((p) => p.papel.nome),
    }));
  }

  static async getById(id: string) {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        instituicao: true,
        perfilServidor: {
          include: {
            perfilProfessor: true,
          },
        },
        papeis: {
          include: {
            papel: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error("Professor não encontrado.");
    }

    const isProfessor = user.papeis.some(
      (papel) => papel.papel.nome === "PROFESSOR"
    );

    if (!isProfessor) {
      throw new Error("O usuário informado não possui o papel PROFESSOR.");
    }

    return {
      id: user.id,
      nome: user.nome,
      email: user.email,
      ativo: user.ativo,

      instituicao: user.instituicao,

      perfilServidor: user.perfilServidor,

      perfilProfessor: user.perfilServidor?.perfilProfessor ?? null,

      roles: user.papeis.map((p) => p.papel.nome),
    };
  }
    static async create(data: {
    nome: string;
    email: string;
    senha: string;
    instituicaoId: string;
    perfilServidor: {
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
    perfilProfessor?: {
      titulacao?: string;
      departamento?: string;
      nce?: string;
      disciplinaIngresso?: string;
    };
  }) {
    return createUserWithStaffProfile({
      nome: data.nome,
      email: data.email,
      senha: data.senha,
      instituicaoId: data.instituicaoId,
      papel: "PROFESSOR",
      perfilServidor: data.perfilServidor,
      ...(data.perfilProfessor ? { perfilProfessor: data.perfilProfessor } : {}),
    });
  }
  static async update(id: string, data: UpdateProfessorDTO) {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
    include: {
      papeis: {
        include: {
          papel: true,
        },
      },
      perfilServidor: {
        include: {
          perfilProfessor: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error("Professor não encontrado.");
  }

  const isProfessor = user.papeis.some(
    (papel) => papel.papel.nome === "PROFESSOR"
  );

  if (!isProfessor) {
    throw new Error("O usuário informado não possui o papel PROFESSOR.");
  }

  return prisma.$transaction(async (tx) => {
    // =========================
    // Atualiza USER
    // =========================

    await tx.user.update({
      where: {
        id,
      },
      data: {
        nome: data.nome,
        email: data.email,
        ativo: data.ativo,
      },
    });

    // =========================
    // Atualiza PERFIL SERVIDOR
    // =========================

    if (data.perfilServidor) {
      if (!user.perfilServidor) {
        throw new Error("Perfil de servidor não encontrado.");
      }

      await tx.perfilServidor.update({
        where: {
          userId: id,
        },
        data: {
          ...data.perfilServidor,
        },
      });
    }

    // =========================
    // Atualiza PERFIL PROFESSOR
    // =========================

    if (data.perfilProfessor) {
      if (!user.perfilServidor?.perfilProfessor) {
        throw new Error("Perfil de professor não encontrado.");
      }

      await tx.perfilProfessor.update({
        where: {
          perfilServidorId: user.perfilServidor.id,
        },
        data: {
          ...data.perfilProfessor,
        },
      });
    }

    // =========================
    // Retorna atualizado
    // =========================

    const updated = await tx.user.findUnique({
      where: {
        id,
      },
      include: {
        instituicao: true,

        perfilServidor: {
          include: {
            perfilProfessor: true,
          },
        },

        papeis: {
          include: {
            papel: true,
          },
        },
      },
    });

    if (!updated) {
      throw new Error("Falha ao recuperar professor atualizado.");
    }

    return {
      id: updated.id,
      nome: updated.nome,
      email: updated.email,
      ativo: updated.ativo,

      instituicao: updated.instituicao,

      perfilServidor: updated.perfilServidor,

      perfilProfessor:
        updated.perfilServidor?.perfilProfessor ?? null,

      roles: updated.papeis.map((p) => p.papel.nome),
    };
  });
    }
}
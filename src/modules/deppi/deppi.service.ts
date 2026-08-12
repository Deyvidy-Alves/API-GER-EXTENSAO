import bcrypt from "bcrypt";

import { prisma } from "../../lib/prisma.js";

import type {
  CreateDeppiDTO,
  UpdateDeppiDTO,
} from "./deppi.schema.js";

import { createUserWithStaffProfile } from "../../utils/usersAndProfiles/createUserWithStaffProfile.js";

function removeUndefined<T extends object>(
  object: T
): Partial<T> {
  return Object.fromEntries(
    Object.entries(object).filter(
      ([, value]) => value !== undefined
    )
  ) as Partial<T>;
}

export class DeppiService {
  /**
   * Cadastra um novo usuário DEPPI.
   *
   * Cria:
   * User
   * PerfilServidor
   * UserPapel → DEPPI
   *
   * A criação é realizada pelo utilitário compartilhado.
   */
  static async create(data: CreateDeppiDTO) {
    return createUserWithStaffProfile({
      nome: data.nome,
      email: data.email,
      senha: data.senha,
      instituicaoId: data.instituicaoId,

      papel: "DEPPI",

      perfilServidor: data.perfilServidor,
    });
  }

  /**
   * Lista todos os usuários que possuem o papel DEPPI.
   *
   * Não retorna a senhaHash.
   */
  static async findAll() {
    const users = await prisma.user.findMany({
      where: {
        papeis: {
          some: {
            papel: {
              nome: "DEPPI",
            },
          },
        },
      },

      select: {
        id: true,
        nome: true,
        nomeUsual: true,
        email: true,
        emailSiape: true,
        ativo: true,
        createdAt: true,

        instituicao: {
          select: {
            id: true,
            nome: true,
            sigla: true,
          },
        },

        perfilServidor: true,

        papeis: {
          select: {
            papel: {
              select: {
                id: true,
                nome: true,
              },
            },
          },
        },
      },

      orderBy: {
        nome: "asc",
      },
    });

    return users;
  }

  /**
   * Busca um DEPPI pelo ID.
   */
  static async findById(id: string) {
    const user = await prisma.user.findFirst({
      where: {
        id,

        papeis: {
          some: {
            papel: {
              nome: "DEPPI",
            },
          },
        },
      },

      select: {
        id: true,
        nome: true,
        nomeUsual: true,
        email: true,
        emailSiape: true,
        emailRecuperacao: true,
        emailNotificacao: true,

        telefonesInstitucionais: true,
        telefonesPessoais: true,

        ativo: true,
        createdAt: true,

        cpf: true,
        dataNascimento: true,
        sexo: true,
        naturalidade: true,
        racaEtnia: true,
        nomeSocial: true,
        estadoCivil: true,

        escolaridade: true,
        rgNumero: true,
        rgOrgaoExpeditor: true,
        rgUf: true,
        rgDataExpedicao: true,

        endereco: true,
        numero: true,
        bairro: true,
        complemento: true,
        cep: true,
        cidade: true,

        instituicao: {
          select: {
            id: true,
            nome: true,
            sigla: true,
          },
        },

        perfilServidor: true,

        papeis: {
          select: {
            papel: {
              select: {
                id: true,
                nome: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new Error("Usuário DEPPI não encontrado.");
    }

    return user;
  }

  /**
   * Atualiza os dados de um usuário DEPPI.
   */
  static async update(id: string, data: UpdateDeppiDTO) {
    const existingUser = await prisma.user.findFirst({
      where: {
        id,

        papeis: {
          some: {
            papel: {
              nome: "DEPPI",
            },
          },
        },
      },

      include: {
        perfilServidor: true,
      },
    });

    if (!existingUser) {
      throw new Error("Usuário DEPPI não encontrado.");
    }

    /**
     * Verifica se o novo e-mail já pertence a outro usuário.
     */
    if (data.email && data.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: {
          email: data.email,
        },
      });

      if (emailExists) {
        throw new Error("Já existe um usuário com este e-mail.");
      }
    }

    /**
     * Se houver alteração de senha,
     * gera um novo hash.
     */
    let senhaHash: string | undefined;

    if (data.senha) {
      senhaHash = await bcrypt.hash(data.senha, 10);
    }

    return prisma.$transaction(async (tx) => {
      /**
       * Atualiza o User.
       */
      const user = await tx.user.update({
        where: {
          id,
        },

        data: {
          ...(data.nome !== undefined && {
            nome: data.nome,
          }),

          ...(data.email !== undefined && {
            email: data.email,
          }),

          ...(data.ativo !== undefined && {
            ativo: data.ativo,
          }),

          ...(senhaHash !== undefined && {
            senhaHash,
          }),
        },

        select: {
          id: true,
          nome: true,
          email: true,
          ativo: true,
          instituicaoId: true,
          createdAt: true,
        },
      });

      /**
       * Atualiza PerfilServidor somente se
       * houver dados para atualizar.
       */
      if (
        data.perfilServidor &&
        Object.keys(data.perfilServidor).length > 0 &&
        existingUser.perfilServidor
        ) {
        const perfilServidorData = removeUndefined(
            data.perfilServidor
        );

        await tx.perfilServidor.update({
            where: {
            id: existingUser.perfilServidor.id,
            },
            data: perfilServidorData,
        });
        }

      /**
       * Retorna o registro atualizado.
       */
      const updatedUser = await tx.user.findUnique({
        where: {
          id: user.id,
        },

        select: {
          id: true,
          nome: true,
          email: true,
          ativo: true,
          instituicaoId: true,
          createdAt: true,

          instituicao: {
            select: {
              id: true,
              nome: true,
              sigla: true,
            },
          },

          perfilServidor: true,

          papeis: {
            select: {
              papel: {
                select: {
                  id: true,
                  nome: true,
                },
              },
            },
          },
        },
      });

      return updatedUser;
    });
  }

  /**
   * Desativa um usuário DEPPI.
   *
   * Soft delete:
   * ativo = false
   */
  static async remove(id: string) {
    const existingUser = await prisma.user.findFirst({
      where: {
        id,

        papeis: {
          some: {
            papel: {
              nome: "DEPPI",
            },
          },
        },
      },
    });

    if (!existingUser) {
      throw new Error("Usuário DEPPI não encontrado.");
    }

    if (!existingUser.ativo) {
      throw new Error("Usuário DEPPI já está inativo.");
    }

    const user = await prisma.user.update({
      where: {
        id,
      },

      data: {
        ativo: false,
      },

      select: {
        id: true,
        nome: true,
        email: true,
        ativo: true,
      },
    });

    return user;
  }
}

import { z } from "zod";

export const perfilServidorSchema = z.object({
  siape: z.string().min(3, "SIAPE inválido."),

  matricula: z.string().min(3, "Matrícula inválida.").optional(),

  setorSuap: z.string().optional(),
  lotacaoSiape: z.string().optional(),
  exercicioSiape: z.string().optional(),

  situacao: z
    .enum([
      "ATIVO",
      "INATIVO",
      "APOSENTADO",
      "CEDIDO",
      "AFASTADO",
    ])
    .optional(),

  regimeTrabalho: z
    .enum([
      "DEDICACAO_EXCLUSIVA",
      "QUARENTA_HORAS",
      "VINTE_HORAS",
    ])
    .optional(),

  jornadaTrabalho: z
    .enum([
      "INTEGRAL",
      "PARCIAL",
      "NOTURNO",
    ])
    .optional(),

  operaRaioX: z.boolean().optional(),

  inicioServicoPublico: z.coerce.date().optional(),
  dataPosseInstituicao: z.coerce.date().optional(),
  inicioExercicioInstituicao: z.coerce.date().optional(),
  dataPosseCargo: z.coerce.date().optional(),
  inicioExercicioCargo: z.coerce.date().optional(),

  cargo: z.string().optional(),
  classeCargo: z.string().optional(),
  padrao: z.string().optional(),
  grupoCargo: z.string().optional(),
  codigoVaga: z.string().optional(),

  banco: z.string().optional(),
  agencia: z.string().optional(),
  contaCorrente: z.string().optional(),
});

/**
 * Cadastro de um usuário DEPPI.
 */
export const createDeppiSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres."),

  email: z.email("E-mail inválido."),

  senha: z.string().min(8, "Senha deve ter pelo menos 8 caracteres."),

  instituicaoId: z.uuid("ID da instituição inválido."),

  perfilServidor: perfilServidorSchema,
});

/**
 * Atualização do usuário DEPPI.
 *
 * Todos os campos são opcionais.
 */
export const updateDeppiSchema = z.object({
  nome: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres.")
    .optional(),

  email: z.email("E-mail inválido.").optional(),

  ativo: z.boolean().optional(),

  senha: z
    .string()
    .min(8, "Senha deve ter pelo menos 8 caracteres.")
    .optional(),

  perfilServidor: perfilServidorSchema.partial().optional(),
});

/**
 * ID recebido pela URL.
 */
export const deppiIdSchema = z.object({
  id: z.uuid("ID do DEPPI inválido."),
});

export type CreateDeppiDTO = z.infer<typeof createDeppiSchema>;
export type UpdateDeppiDTO = z.infer<typeof updateDeppiSchema>;
export type DeppiIdDTO = z.infer<typeof deppiIdSchema>;


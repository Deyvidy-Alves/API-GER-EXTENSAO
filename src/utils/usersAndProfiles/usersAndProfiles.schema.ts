import { z } from "zod";

export const perfilServidorSchema = z.object({
  siape: z.string().min(3, "SIAPE inválido"),
  matricula: z.string().min(3).optional(),
  setorSuap: z.string().optional(),
  lotacaoSiape: z.string().optional(),
  exercicioSiape: z.string().optional(),
  situacao: z.enum(["ATIVO", "INATIVO", "APOSENTADO", "CEDIDO", "AFASTADO"]).optional(),
  regimeTrabalho: z.enum(["DEDICACAO_EXCLUSIVA", "QUARENTA_HORAS", "VINTE_HORAS"]).optional(),
  jornadaTrabalho: z.enum(["INTEGRAL", "PARCIAL", "NOTURNO"]).optional(),
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

export const createDeppiSchema = z.object({
  nome: z.string().min(2),
  email: z.string().email(),
  senha: z.string().min(8),
  instituicaoId: z.string().uuid(),
  perfilServidor: perfilServidorSchema,
});

export const updateDeppiSchema = z.object({
  nome: z.string().min(2).optional(),
  email: z.string().email().optional(),
  ativo: z.boolean().optional(),
  perfilServidor: perfilServidorSchema.partial().optional(),
});
import { z } from "zod";

export const createDepartamentoSchema = z.object({
  nome: z.string().min(2, "Nome inválido"),
  sigla: z.string().optional(),
  instituicaoId: z.string().uuid("instituicaoId inválido"),
});

export const updateDepartamentoSchema = z.object({
  nome: z.string().min(2).optional(),
  sigla: z.string().optional(),
  instituicaoId: z.string().uuid().optional(),
  ativo: z.boolean().optional(),
});

export const listDepartamentosQuerySchema = z.object({
  instituicaoId: z.string().uuid().optional(),
});

export type CreateDepartamentoDTO = z.infer<typeof createDepartamentoSchema>;
export type UpdateDepartamentoDTO = z.infer<typeof updateDepartamentoSchema>;
export type ListDepartamentosQueryDTO = z.infer<typeof listDepartamentosQuerySchema>;

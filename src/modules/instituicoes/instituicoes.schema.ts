import { z } from "zod";

export const createInstituicaoSchema = z.object({
  nome: z.string().min(2, "Nome inválido"),
  sigla: z.string().min(2, "Sigla inválida"),
  endereco: z.string().optional(),
});

export const updateInstituicaoSchema = z.object({
  nome: z.string().min(2).optional(),
  sigla: z.string().min(2).optional(),
  endereco: z.string().optional(),
  ativo: z.boolean().optional(),
});

export const toggleAtivoSchema = z.object({
  ativo: z.boolean(),
});

export const instituicaoIdParamSchema = z.object({
  id: z.string().uuid("ID inválido"),
});

export type CreateInstituicaoDTO = z.infer<typeof createInstituicaoSchema>;
export type UpdateInstituicaoDTO = z.infer<typeof updateInstituicaoSchema>;

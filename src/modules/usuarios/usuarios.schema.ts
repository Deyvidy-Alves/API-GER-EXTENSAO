import { z } from "zod";

export const listUsuariosQuerySchema = z.object({
  q: z.string().optional(),
  papel: z.string().optional(),
  ativo: z.enum(["true", "false"]).optional(),
});

export const updateUsuarioSchema = z.object({
  nome: z.string().min(2).optional(),
  nomeUsual: z.string().optional(),
  email: z.string().email().optional(),
  telefonesPessoais: z.string().optional(),
  telefonesInstitucionais: z.string().optional(),
  instituicaoId: z.string().uuid().optional(),
  ativo: z.boolean().optional(),
});

export type ListUsuariosQueryDTO = z.infer<typeof listUsuariosQuerySchema>;
export type UpdateUsuarioDTO = z.infer<typeof updateUsuarioSchema>;

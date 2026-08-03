import { z } from 'zod';

export const AtualizarPerfilSchema = z.object({
  titulacao: z.string().optional(),
  departamento: z.string().optional(),
  nce: z.string().optional(),
  disciplinaIngresso: z.string().optional(),
});

export type AtualizarPerfilDTO = z.infer<typeof AtualizarPerfilSchema>;

import { z } from "zod";

export const createPermissaoSchema = z.object({
  recurso: z.string().min(2, "Recurso inválido"),
  acao: z.string().min(2, "Ação inválida"),
});

export const vincularPapelSchema = z.object({
  papelId: z.string().uuid("papelId inválido"),
});

export const vincularPermissaoSchema = z.object({
  permissaoId: z.string().uuid("permissaoId inválido"),
});

export type CreatePermissaoDTO = z.infer<typeof createPermissaoSchema>;

import { z } from 'zod';

export const createUserSchema = z.object({
  nome: z.string().min(2, 'O nome deve conter pelo menos 2 caracteres'),
  email: z.email("E-mail inválido"),
  senha: z.string().min(8, 'A senha deve conter pelo menos 8 caracters'),
  instituicaoId: z.uuid(),
  papel: z.enum(['DEPPI', 'PROFESSOR', 'ALUNO']) //ADMIN NAO SE CRIA SOZINHO
});
export type CreateUserDTO = z.infer<typeof createUserSchema>

export const updateUserSchema = z.object({
  nome: z.string().min(2).optional(),
  email: z.email().optional(),
  ativo: z.boolean().optional(),
});
export type UpdateUserDTO = z.infer<typeof updateUserSchema>
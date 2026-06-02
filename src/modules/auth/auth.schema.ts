import { z } from 'zod'

export const registerSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres.'),
  email: z.email('Email inválido.'),
  senha: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres.'),
  instituicaoId: z.uuid('ID da instituicao inválido.')
})

export type RegisterDTO = z.infer<typeof registerSchema>
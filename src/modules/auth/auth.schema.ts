import { z } from 'zod'

export const registerSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres.'),
  email: z.email('Email inválido.'),
  senha: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres.'),
  instituicaoId: z.uuid('ID da instituicao inválido.')
})

export const loginSchema = z.object({
  email: z.email('Email inválido.'),
  senha: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres.')
})

export const forgotPasswordSchema = z.object({
  email: z.email('Email inválido.')
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório.'),
  novaSenha: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres.')
})

export type RegisterDTO = z.infer<typeof registerSchema>
export type LoginDTO = z.infer<typeof loginSchema>
export type ForgotPasswordDTO = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordDTO = z.infer<typeof resetPasswordSchema>
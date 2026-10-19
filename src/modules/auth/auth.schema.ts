import { z } from 'zod'
import { isValidCpf } from '../../utils/isValidCpf.js'

// Normaliza o email antes de validar o formato: remove espaços nas pontas e
// deixa tudo em minúsculo, para evitar contas duplicadas (Ana@x.com vs ana@x.com)
// e falhas de login por diferença de caixa.
const emailNormalizado = z.string().trim().toLowerCase().pipe(z.email('Email inválido.'))

export const registerSchema = z.object({
    nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres.'),
    email: emailNormalizado,
    senha: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres.'),
    confirmarSenha: z.string().min(8, 'Confirmação de senha é obrigatória.'),
    instituicaoId: z.uuid('ID da instituicao inválido.'),
    cpf: z.string().refine(isValidCpf, 'CPF inválido.')
  }).refine((data) => data.senha === data.confirmarSenha, {
  message: 'As senhas não coincidem.',
  path: ['confirmarSenha']
})

export const loginSchema = z.object({
  email: emailNormalizado,
  senha: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres.')
})

export const forgotPasswordSchema = z.object({
  email: emailNormalizado
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório.'),
  novaSenha: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres.')
})

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh Token é obrigatório')
})

export const logoutSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh Token é obrigatório')
})

export type RegisterDTO = z.infer<typeof registerSchema>
export type LoginDTO = z.infer<typeof loginSchema>
export type ForgotPasswordDTO = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordDTO = z.infer<typeof resetPasswordSchema>
export type RefreshTokenDTO = z.infer<typeof refreshTokenSchema>
export type LogoutDTO = z.infer<typeof logoutSchema>

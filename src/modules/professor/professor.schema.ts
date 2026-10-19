import { z } from 'zod';
import { perfilServidorSchema } from '../../utils/usersAndProfiles/usersAndProfiles.schema.js';

export const AtualizarPerfilSchema = z.object({
  titulacao: z.string().optional(),
  departamento: z.string().optional(),
  nce: z.string().optional(),
  disciplinaIngresso: z.string().optional(),
});

export type AtualizarPerfilDTO = z.infer<typeof AtualizarPerfilSchema>;

// Criação de um professor completo (usuário + perfil servidor + perfil
// professor + papel PROFESSOR). Usado por DEPPI/ADMIN.
export const CriarProfessorSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres.'),
  email: z.string().trim().toLowerCase().pipe(z.email('Email inválido.')),
  senha: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres.'),
  instituicaoId: z.uuid('ID da instituicao inválido.'),
  perfilServidor: perfilServidorSchema,
  perfilProfessor: z
    .object({
      titulacao: z.string().optional(),
      departamento: z.string().optional(),
      nce: z.string().optional(),
      disciplinaIngresso: z.string().optional(),
    })
    .optional(),
});

export type CriarProfessorDTO = z.infer<typeof CriarProfessorSchema>;

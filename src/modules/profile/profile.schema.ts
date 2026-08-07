import { z } from 'zod';

export const StudentProfileSchema = z.object({
  matricula: z.string().min(1, 'Matricula obrigatória'),
  cursoGraduacao: z.string().min(1, 'Curso obrigatório'),
  semestre: z.int().min(1).max(10).optional()
});

export type StudentProfilelDTO = z.infer<typeof StudentProfileSchema>

export const TelefoneSchema = z.object({
  telefonesInstitucionais: z.array(
    z.string().min(1, 'Telefone inválido')
  ).optional(),
  telefonesPessoais: z.array(
    z.string().min(1, 'Telefone inválido')
  ).optional(),
}).refine(
  (data) => data.telefonesInstitucionais || data.telefonesPessoais,
  { message: 'Informe ao menos um telefone institucional ou pessoal.' }
);


export const EnderecoSchema = z.object({
  endereco: z.string().min(1).optional(),
  numero: z.string().min(1).optional(),
  bairro: z.string().min(1).optional(),
  complemento: z.string().optional(),
  cep: z.string().length(8, 'CEP deve ter 8 dígitos').optional(),
  cidade: z.string().min(1).optional(),
});


export type TelefoneDTO = z.infer<typeof TelefoneSchema>;
export type EnderecoDTO = z.infer<typeof EnderecoSchema>;
import { z } from 'zod';

export const CriarCursoSchema = z.object({
  titulo: z.string().min(1, 'Título obrigatório'),
  tipoAcao: z.enum(['CURSO', 'EVENTO', 'PROJETO', 'PROGRAMA']),
  tipo: z.enum(['FORMACAO_INICIAL', 'FORMACAO_CONTINUADA']).default('FORMACAO_CONTINUADA'),
  areaTematica: z.string().min(1, 'Área temática obrigatória'),
  linhaExtensao: z.string().min(1, 'Linha de extensão obrigatória'),
  localAtuacao: z.enum(['URBANO', 'RURAL']),
  modeloOferta: z.enum(['PRESENCIAL', 'ONLINE', 'HIBRIDO']),
  cargaHoraria: z.int().min(1, 'Carga horária deve ser positiva'),
  dataInicio: z.coerce.date(),
  dataFim: z.coerce.date(),
  minBeneficiados: z.int().min(1),
  maxBeneficiados: z.int().min(1),
  fomento: z.string().optional(),
  programaInstitucional: z.string().optional(),
  apresentacao: z.string().min(1, 'Apresentação obrigatória'),
  justificativa: z.string().min(1, 'Justificativa obrigatória'),
  publicoAlvo: z.string().min(1, 'Público-alvo obrigatório'),
  objetivoGeral: z.string().min(1, 'Objetivo geral obrigatório'),
  objetivosEspecificos: z.string().min(1, 'Objetivos específicos obrigatórios'),
  metodologia: z.string().min(1, 'Metodologia obrigatória'),
}).refine(data => data.dataFim > data.dataInicio, {
  message: 'Data de fim deve ser após a data de início',
  path: ['dataFim'],
}).refine(data => data.maxBeneficiados >= data.minBeneficiados, {
  message: 'Máximo de beneficiados deve ser maior ou igual ao mínimo',
  path: ['maxBeneficiados'],
});

export type CriarCursoDTO = z.infer<typeof CriarCursoSchema>;

export const AtualizarPerfilSchema = z.object({
  titulacao: z.string().optional(),
  departamento: z.string().optional(),
  nce: z.string().optional(),
  disciplinaIngresso: z.string().optional(),
});

export type AtualizarPerfilDTO = z.infer<typeof AtualizarPerfilSchema>;

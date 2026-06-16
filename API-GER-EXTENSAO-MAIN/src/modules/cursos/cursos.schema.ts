import { z } from 'zod';

export const CreateCursoSchema = z.object({
  // IDENTIFICACAO
  titulo: z.string().min(1, 'Título obrigatório'),
  tipoAcao: z.enum(['CURSO', 'EVENTO', 'PROJETO', 'PROGRAMA']),
  tipo: z.enum(['FORMACAO_INICIAL', 'FORMACAO_CONTINUADA']).optional(),
  areaTematica: z.string().min(1, 'Área temática obrigatória'),
  linhaExtensao: z.string().min(1, 'Linha de extensão obrigatória'),
  localAtuacao: z.enum(['URBANO', 'RURAL']),
  modeloOferta: z.enum(['PRESENCIAL', 'ONLINE', 'HIBRIDO']),

  // DATAS, VAGAS, CARGA HORARIA
  cargaHoraria: z.int().min(1, 'Carga horária deve ser maior que zero'),
  dataInicio: z.coerce.date(),
  dataFim: z.coerce.date(),
  minBeneficiados: z.int().min(0),
  maxBeneficiados: z.int().min(1),

  // METADADOS INSTITUCIONAIS
  fomento: z.string().optional(),
  programaInstitucional: z.string().optional(),

  // TEXTOS DESCRITIVOS
  apresentacao: z.string().min(1, 'Apresentação obrigatória'),
  justificativa: z.string().min(1, 'Justificativa obrigatória'),
  publicoAlvo: z.string().min(1, 'Público alvo obrigatório'),
  objetivoGeral: z.string().min(1, 'Objetivo geral obrigatório'),
  objetivosEspecificos: z.string().min(1, 'Objetivos específicos obrigatórios'),
  metodologia: z.string().min(1, 'Metodologia obrigatória'),

  // FK
  instituicaoId: z.uuid('instituicaoId deve ser um uuid válido'),
}).refine((data) => data.dataFim > data.dataInicio, {
  message: 'dataFim deve ser posterior a dataInicio',
  path: ['dataFim'],
}).refine((data) => data.maxBeneficiados >= data.minBeneficiados, {
  message: 'maxBeneficiados deve ser maior ou igual a minBeneficiados',
  path: ['maxBeneficiados'],
});

export const UpdateCursoSchema = z.object({
  titulo: z.string().min(1).optional(),
  tipoAcao: z.enum(['CURSO', 'EVENTO', 'PROJETO', 'PROGRAMA']).optional(),
  tipo: z.enum(['FORMACAO_INICIAL', 'FORMACAO_CONTINUADA']).optional(),
  areaTematica: z.string().min(1).optional(),
  linhaExtensao: z.string().min(1).optional(),
  localAtuacao: z.enum(['URBANO', 'RURAL']).optional(),
  modeloOferta: z.enum(['PRESENCIAL', 'ONLINE', 'HIBRIDO']).optional(),
  status: z.enum(['RASCUNHO', 'PUBLICADO', 'EM_ANDAMENTO', 'ENCERRADO', 'CANCELADO']).optional(),

  cargaHoraria: z.int().min(1).optional(),
  dataInicio: z.coerce.date().optional(),
  dataFim: z.coerce.date().optional(),
  minBeneficiados: z.int().min(0).optional(),
  maxBeneficiados: z.int().min(1).optional(),

  fomento: z.string().optional(),
  programaInstitucional: z.string().optional(),

  apresentacao: z.string().min(1).optional(),
  justificativa: z.string().min(1).optional(),
  publicoAlvo: z.string().min(1).optional(),
  objetivoGeral: z.string().min(1).optional(),
  objetivosEspecificos: z.string().min(1).optional(),
  metodologia: z.string().min(1).optional(),
}).refine((data) => {
  if (data.dataInicio && data.dataFim) {
    return data.dataFim > data.dataInicio;
  }
  return true;
}, {
  message: 'dataFim deve ser posterior a dataInicio',
  path: ['dataFim'],
});

export const ListCursosQuerySchema = z.object({
  status: z.enum(['RASCUNHO', 'PUBLICADO', 'EM_ANDAMENTO', 'ENCERRADO', 'CANCELADO']).optional(),
  tipo: z.enum(['FORMACAO_INICIAL', 'FORMACAO_CONTINUADA']).optional(),
  tipoAcao: z.enum(['CURSO', 'EVENTO', 'PROJETO', 'PROGRAMA']).optional(),
});

export const CursoIdParamSchema = z.object({
  id: z.uuid('id deve ser um uuid válido'),
});

export type CreateCursoDTO = z.infer<typeof CreateCursoSchema>;
export type UpdateCursoDTO = z.infer<typeof UpdateCursoSchema>;
export type ListCursosQueryDTO = z.infer<typeof ListCursosQuerySchema>;
export type CursoIdParamDTO = z.infer<typeof CursoIdParamSchema>;
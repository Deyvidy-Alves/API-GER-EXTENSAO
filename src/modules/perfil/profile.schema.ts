import { z } from 'zod';

export const StudentProfileSchema = z.object({
  matricula: z.string().min(1, 'Matricula obrigatória'),
  cursoGraduacao: z.string().min(1, 'Curso obrigatório'),
  semestre: z.int().min(1).max(10).optional()
});

export type StudentProfilelDTO = z.infer<typeof StudentProfileSchema>
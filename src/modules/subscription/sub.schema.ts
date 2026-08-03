import { z } from 'zod';
import { StatusInscricao } from '../../../prisma/generated/prisma/enums.js';

export const CreateSubSchema = z.object({
  cursoId: z.uuid({ message: 'O valor fornecido não é um UUID válido para curso' }),
}); 

export const UpdateStatusSchema = z.object({
  observacao: z.string().min(1).max(500).optional(),
});


export type CreateSubDTO = z.infer<typeof CreateSubSchema>
export type UpdateStatusDTO = z.infer<typeof UpdateStatusSchema>;

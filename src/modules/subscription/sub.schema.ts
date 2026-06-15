import { z } from 'zod';
import { StatusInscricao } from '../../../generated/prisma/enums.js';

export const CreateSubSchema = z.object({
  cursoId: z.uuid({ message: 'O valor fornecido não é um UUID válido para curso' }),
}); 

export type CreateSubDTO = z.infer<typeof CreateSubSchema>
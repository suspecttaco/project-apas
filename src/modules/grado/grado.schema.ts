import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const GradoResponseSchema = z.object({
  id:     z.string().uuid(),
  idPlan: z.string().uuid(),
  nombre: z.string(),
  numero: z.number().int(),
  activo: z.boolean(),
  fCre:   z.date(),
  fMod:   z.date(),
}).openapi('GradoResponse');

export type GradoResponseDTO = z.infer<typeof GradoResponseSchema>;

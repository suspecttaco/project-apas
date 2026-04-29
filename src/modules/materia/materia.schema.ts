import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const MateriaResponseSchema = z.object({
  id:     z.string().uuid(),
  idPlan: z.string().uuid(),
  nombre: z.string(),
  desc:   z.string().nullable(),
  activo: z.boolean(),
  fCre:   z.date(),
  fMod:   z.date(),
}).openapi('MateriaResponse');

export type MateriaResponseDTO = z.infer<typeof MateriaResponseSchema>;

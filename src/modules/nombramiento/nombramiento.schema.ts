import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const NombramientoResponseSchema = z.object({
  id:     z.string().uuid(),
  nombre: z.string(),
  activo: z.boolean(),
  fCre:   z.date(),
  fMod:   z.date(),
}).openapi('NombramientoResponse');

export type NombramientoResponseDTO = z.infer<typeof NombramientoResponseSchema>;

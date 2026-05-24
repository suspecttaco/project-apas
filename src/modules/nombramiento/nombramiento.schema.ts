import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const CreateNombramientoSchema = z.object({
  nombre: z.string().max(100).openapi({ example: 'Profesor de Telesecundaria' }),
}).openapi('CreateNombramiento');

export const UpdateNombramientoSchema = CreateNombramientoSchema.partial().openapi('UpdateNombramiento');

export const NombramientoResponseSchema = z.object({
  id:     z.string().uuid(),
  nombre: z.string(),
  activo: z.boolean(),
  fCre:   z.date(),
  fMod:   z.date(),
}).openapi('NombramientoResponse');

export type CreateNombramientoDTO   = z.infer<typeof CreateNombramientoSchema>;
export type UpdateNombramientoDTO   = z.infer<typeof UpdateNombramientoSchema>;
export type NombramientoResponseDTO = z.infer<typeof NombramientoResponseSchema>;
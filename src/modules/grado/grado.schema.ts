import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const CreateGradoSchema = z.object({
  idPlan: z.string().uuid().openapi({ example: 'uuid-del-plan' }),
  nombre: z.string().max(25).openapi({ example: 'Primer Grado' }),
  numero: z.number().int().positive().openapi({ example: 1 }),
}).openapi('CreateGrado');

export const UpdateGradoSchema = z.object({
  nombre: z.string().max(25).optional().openapi({ example: 'Primer Grado Actualizado' }),
}).openapi('UpdateGrado');

export const GradoResponseSchema = z.object({
  id:     z.string().uuid(),
  idPlan: z.string().uuid(),
  nombre: z.string(),
  numero: z.number().int(),
  activo: z.boolean(),
  fCre:   z.date(),
  fMod:   z.date(),
}).openapi('GradoResponse');

export type CreateGradoDTO   = z.infer<typeof CreateGradoSchema>;
export type UpdateGradoDTO   = z.infer<typeof UpdateGradoSchema>;
export type GradoResponseDTO = z.infer<typeof GradoResponseSchema>;
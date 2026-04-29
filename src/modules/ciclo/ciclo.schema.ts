import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const CreateCicloSchema = z.object({
  idPlan:  z.string().uuid().openapi({ example: 'uuid-del-plan' }),
  nombre:  z.string().max(20).openapi({ example: '2024-2025' }),
  fInicio: z.coerce.date().openapi({ example: '2024-08-26' }),
  fFin:    z.coerce.date().openapi({ example: '2025-07-11' }),
}).openapi('CreateCiclo');

export const UpdateCicloSchema = CreateCicloSchema.partial().openapi('UpdateCiclo');

export const CicloResponseSchema = z.object({
  id:      z.string().uuid(),
  idPlan:  z.string().uuid(),
  idEsc:   z.string().uuid(),
  nombre:  z.string(),
  fInicio: z.date(),
  fFin:    z.date(),
  activo:  z.boolean(),
  fCre:    z.date(),
  fMod:    z.date(),
}).openapi('CicloResponse');

export type CreateCicloDTO   = z.infer<typeof CreateCicloSchema>;
export type UpdateCicloDTO   = z.infer<typeof UpdateCicloSchema>;
export type CicloResponseDTO = z.infer<typeof CicloResponseSchema>;

import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const CreateTurnoSchema = z.object({
  nombre: z.string().max(25).openapi({ example: 'Matutino' }),
  desc:   z.string().optional().openapi({ example: 'Turno de la manana' }),
  hInicio: z.string().regex(/^\d{2}:\d{2}$/).openapi({ example: '07:00' }),
  hFin:    z.string().regex(/^\d{2}:\d{2}$/).openapi({ example: '13:00' }),
}).openapi('CreateTurno');

export const UpdateTurnoSchema = CreateTurnoSchema.partial().openapi('UpdateTurno');

export const TurnoResponseSchema = z.object({
  id:      z.string().uuid(),
  idEsc:   z.string().uuid(),
  nombre:  z.string(),
  desc:    z.string().nullable(),
  hInicio: z.string(),
  hFin:    z.string(),
  activo:  z.boolean(),
  fCre:    z.date(),
  fMod:    z.date(),
}).openapi('TurnoResponse');

export type CreateTurnoDTO   = z.infer<typeof CreateTurnoSchema>;
export type UpdateTurnoDTO   = z.infer<typeof UpdateTurnoSchema>;
export type TurnoResponseDTO = z.infer<typeof TurnoResponseSchema>;

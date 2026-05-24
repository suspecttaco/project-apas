import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const CreateRolEmpleadoSchema = z.object({
  nombre: z.string().max(25).openapi({ example: 'Coordinador' }),
  desc:   z.string().optional().openapi({ example: 'Coordinador academico' }),
}).openapi('CreateRolEmpleado');

export const UpdateRolEmpleadoSchema = CreateRolEmpleadoSchema.partial().openapi('UpdateRolEmpleado');

export const RolEmpleadoResponseSchema = z.object({
  id:     z.string().uuid(),
  nombre: z.string(),
  desc:   z.string().nullable(),
  activo: z.boolean(),
  fCre:   z.date(),
  fMod:   z.date(),
}).openapi('RolEmpleadoResponse');

export type CreateRolEmpleadoDTO   = z.infer<typeof CreateRolEmpleadoSchema>;
export type UpdateRolEmpleadoDTO   = z.infer<typeof UpdateRolEmpleadoSchema>;
export type RolEmpleadoResponseDTO = z.infer<typeof RolEmpleadoResponseSchema>;
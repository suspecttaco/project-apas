import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const CreateRolSchema = z.object({
  nombre:          z.string().max(30).openapi({ example: 'coordinador' }),
  desc:            z.string().optional().openapi({ example: 'Coordinador academico' }),
  requiereEscuela: z.boolean().openapi({ example: false }),
}).openapi('CreateRol');

export const UpdateRolSchema = CreateRolSchema.partial().openapi('UpdateRol');

// Lista de ids de permisos a asignar al rol -- reemplaza completo
export const AsignarPermisosSchema = z.object({
  idPermisos: z.array(z.string().uuid()).openapi({ example: ['uuid-permiso-1', 'uuid-permiso-2'] }),
}).openapi('AsignarPermisos');

export const RolResponseSchema = z.object({
  id:              z.string().uuid(),
  nombre:          z.string(),
  desc:            z.string().nullable(),
  requiereEscuela: z.boolean(),
  activo:          z.boolean(),
  fCre:            z.date(),
  fMod:            z.date(),
}).openapi('RolResponse');

export type CreateRolDTO       = z.infer<typeof CreateRolSchema>;
export type UpdateRolDTO       = z.infer<typeof UpdateRolSchema>;
export type AsignarPermisosDTO = z.infer<typeof AsignarPermisosSchema>;
export type RolResponseDTO     = z.infer<typeof RolResponseSchema>;
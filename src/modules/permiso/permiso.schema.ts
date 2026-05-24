import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const CreatePermisoSchema = z.object({
  // Formato esperado: recurso:accion, ej. 'escuelas:read'
  nombre: z.string().max(50).regex(/^[a-z]+:[a-z]+$/, 'Formato invalido, usar recurso:accion').openapi({ example: 'reportes:read' }),
  desc:   z.string().optional().openapi({ example: 'Ver reportes del sistema' }),
}).openapi('CreatePermiso');

export const UpdatePermisoSchema = CreatePermisoSchema.partial().openapi('UpdatePermiso');

export const PermisoResponseSchema = z.object({
  id:     z.string().uuid(),
  nombre: z.string(),
  desc:   z.string().nullable(),
  activo: z.boolean(),
  fCre:   z.date(),
  fMod:   z.date(),
}).openapi('PermisoResponse');

export type CreatePermisoDTO   = z.infer<typeof CreatePermisoSchema>;
export type UpdatePermisoDTO   = z.infer<typeof UpdatePermisoSchema>;
export type PermisoResponseDTO = z.infer<typeof PermisoResponseSchema>;
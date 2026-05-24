import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const CreateUsuarioSchema = z.object({
  nombre: z.string().max(100).openapi({ example: 'Juan Perez Lopez' }),
  correo: z.string().email().openapi({ example: 'usuario@sepyc.gob.mx' }),
  contra: z.string().min(6).openapi({ example: 'contrasena123' }),
  idRol:  z.string().uuid().openapi({ example: 'uuid-del-rol' }),
  // Opcional: requerido solo si el rol del usuario tiene requiereEscuela = true
  idEsc:  z.string().uuid().optional().openapi({ example: 'uuid-de-la-escuela' }),
}).openapi('CreateUsuario');

export const UpdateUsuarioSchema = z.object({
  nombre: z.string().max(100).optional(),
  correo: z.string().email().optional(),
  contra: z.string().min(6).optional(),
  idRol:  z.string().uuid().optional(),
  idEsc:  z.string().uuid().nullable().optional(),
}).openapi('UpdateUsuario');

export const UsuarioResponseSchema = z.object({
  id:     z.string().uuid(),
  nombre: z.string(),
  correo: z.string(),
  idRol:  z.string().uuid(),
  idEsc:  z.string().uuid().nullable(),
  activo: z.boolean(),
  fCre:   z.date(),
  fMod:   z.date(),
}).openapi('UsuarioResponse');

export type CreateUsuarioDTO   = z.infer<typeof CreateUsuarioSchema>;
export type UpdateUsuarioDTO   = z.infer<typeof UpdateUsuarioSchema>;
export type UsuarioResponseDTO = z.infer<typeof UsuarioResponseSchema>;
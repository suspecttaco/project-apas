import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const CreateGrupoSchema = z.object({
  idGrado: z.string().uuid().openapi({ example: 'uuid-del-grado' }),
  idTurno: z.string().uuid().openapi({ example: 'uuid-del-turno' }),
  nombre:  z.string().max(5).openapi({ example: 'A' }),
}).openapi('CreateGrupo');

export const UpdateGrupoSchema = CreateGrupoSchema.partial().openapi('UpdateGrupo');

export const GrupoResponseSchema = z.object({
  id:      z.string().uuid(),
  idEsc:   z.string().uuid(),
  idGrado: z.string().uuid(),
  idTurno: z.string().uuid(),
  nombre:  z.string(),
  activo:  z.boolean(),
  fCre:    z.date(),
  fMod:    z.date(),
}).openapi('GrupoResponse');

export type CreateGrupoDTO   = z.infer<typeof CreateGrupoSchema>;
export type UpdateGrupoDTO   = z.infer<typeof UpdateGrupoSchema>;
export type GrupoResponseDTO = z.infer<typeof GrupoResponseSchema>;

import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const UpdateEstadisticaSchema = z.object({
  inscH:        z.number().int().nonnegative().optional().openapi({ example: 15 }),
  inscM:        z.number().int().nonnegative().optional().openapi({ example: 12 }),
  altasH:       z.number().int().nonnegative().optional().openapi({ example: 1 }),
  altasM:       z.number().int().nonnegative().optional().openapi({ example: 0 }),
  bajasH:       z.number().int().nonnegative().optional().openapi({ example: 0 }),
  bajasM:       z.number().int().nonnegative().optional().openapi({ example: 1 }),
  aprobTodosH:  z.number().int().nonnegative().nullable().optional(),
  aprobTodosM:  z.number().int().nonnegative().nullable().optional(),
  reprobH:      z.number().int().nonnegative().nullable().optional(),
  reprobM:      z.number().int().nonnegative().nullable().optional(),
  repetidoresH: z.number().int().nonnegative().nullable().optional(),
  repetidoresM: z.number().int().nonnegative().nullable().optional(),
}).openapi('UpdateEstadistica');

export const EstadisticaResponseSchema = z.object({
  id:      z.string().uuid(),
  idCiclo: z.string().uuid(),
  idGrupo: z.string().uuid(),

  inscH: z.number().int(),
  inscM: z.number().int(),

  altasH: z.number().int(),
  altasM: z.number().int(),

  bajasH: z.number().int(),
  bajasM: z.number().int(),

  existenciaH: z.number().int(),
  existenciaM: z.number().int(),
  existenciaT: z.number().int(),

  desercionH: z.number(),
  desercionM: z.number(),

  aprobTodosH:  z.number().int().nullable(),
  aprobTodosM:  z.number().int().nullable(),
  reprobH:      z.number().int().nullable(),
  reprobM:      z.number().int().nullable(),
  repetidoresH: z.number().int().nullable(),
  repetidoresM: z.number().int().nullable(),

  fCre: z.date(),
  fMod: z.date(),
}).openapi('EstadisticaResponse');

export type UpdateEstadisticaDTO   = z.infer<typeof UpdateEstadisticaSchema>;
export type EstadisticaResponseDTO = z.infer<typeof EstadisticaResponseSchema>;

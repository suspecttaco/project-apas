import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const CreatePlazaSchema = z.object({
  idEmpleado:     z.string().uuid().openapi({ example: 'uuid-del-empleado' }),
  idNombramiento: z.string().uuid().openapi({ example: 'uuid-del-nombramiento' }),
  idMateria:      z.string().uuid().optional().openapi({ example: 'uuid-de-la-materia' }),
  codigoPlaza:    z.string().max(30).openapi({ example: '10EES0001P1A001' }),
  horasClase:     z.number().int().positive().optional().openapi({ example: 20 }),
  horasDescarga:  z.number().int().nonnegative().optional().openapi({ example: 5 }),
  horasFortalec:  z.number().int().nonnegative().optional().openapi({ example: 3 }),
  funcDescarga:   z.string().optional().openapi({ example: 'Coordinacion academica' }),
  evaluado:       z.string().max(255).optional(),
  observaciones:  z.string().optional(),
  idGrupos:       z.array(z.string().uuid()).optional().openapi({ example: ['uuid-grupo-1', 'uuid-grupo-2'] }),
}).openapi('CreatePlaza');

export const UpdatePlazaSchema = CreatePlazaSchema.partial().openapi('UpdatePlaza');

export const PlazaResponseSchema = z.object({
  id:             z.string().uuid(),
  idEmpleado:     z.string().uuid(),
  idNombramiento: z.string().uuid(),
  idMateria:      z.string().uuid().nullable(),
  idEsc:          z.string().uuid(),
  codigoPlaza:    z.string(),
  horasClase:     z.number().int().nullable(),
  horasDescarga:  z.number().int().nullable(),
  horasFortalec:  z.number().int().nullable(),
  funcDescarga:   z.string().nullable(),
  evaluado:       z.string().nullable(),
  observaciones:  z.string().nullable(),
  activo:         z.boolean(),
  fCre:           z.date(),
  fMod:           z.date(),
}).openapi('PlazaResponse');

export type CreatePlazaDTO   = z.infer<typeof CreatePlazaSchema>;
export type UpdatePlazaDTO   = z.infer<typeof UpdatePlazaSchema>;
export type PlazaResponseDTO = z.infer<typeof PlazaResponseSchema>;

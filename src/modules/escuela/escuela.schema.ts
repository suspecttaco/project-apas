import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const CreateEscuelaSchema = z.object({
  nombre:       z.string().max(100).openapi({ example: 'Secundaria Lazaro Cardenas' }),
  clave:        z.string().max(10).openapi({ example: 'SIN0001' }),
  zonaEscolar:  z.string().max(5).openapi({ example: 'Z001' }),
  nivel:        z.string().max(20).openapi({ example: 'Secundaria' }),
  numTel:       z.string().max(10).optional().openapi({ example: '6681234567' }),
  correo:       z.string().email().optional().openapi({ example: 'escuela@sepyc.gob.mx' }),
  domicilio:    z.string().max(255).optional().openapi({ example: 'Blvd. Macario Gaxiola 123' }),
  localidad:    z.string().max(50).optional().openapi({ example: 'Los Mochis' }),
  municipio:    z.string().max(50).optional().openapi({ example: 'Ahome' }),
  estado:       z.string().max(50).optional().openapi({ example: 'Sinaloa' }),
  codigoPostal: z.string().max(5).optional().openapi({ example: '81200' }),
  director: z.object({
    nombre: z.string().max(100).openapi({ example: 'Juan Perez Lopez' }),
    correo: z.string().email().openapi({ example: 'director@escuela.mx' }),
    contra: z.string().min(6).openapi({ example: 'director123' }),
  }),
}).openapi('CreateEscuela');

export const UpdateEscuelaSchema = CreateEscuelaSchema.omit({ director: true }).partial()
  .openapi('UpdateEscuela');

export const EscuelaResponseSchema = z.object({
  id:           z.string().uuid(),
  nombre:       z.string(),
  clave:        z.string(),
  zonaEscolar:  z.string(),
  nivel:        z.string(),
  numTel:       z.string().nullable(),
  correo:       z.string().nullable(),
  domicilio:    z.string().nullable(),
  localidad:    z.string().nullable(),
  municipio:    z.string().nullable(),
  estado:       z.string().nullable(),
  codigoPostal: z.string().nullable(),
  activo:       z.boolean(),
  fCre:         z.date(),
  fMod:         z.date(),
}).openapi('EscuelaResponse');

export type CreateEscuelaDTO   = z.infer<typeof CreateEscuelaSchema>;
export type UpdateEscuelaDTO   = z.infer<typeof UpdateEscuelaSchema>;
export type EscuelaResponseDTO = z.infer<typeof EscuelaResponseSchema>;
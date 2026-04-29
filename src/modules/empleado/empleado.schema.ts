import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

const DireccionSchema = z.object({
  calle1:  z.string().max(100).optional().openapi({ example: 'Blvd. Macario Gaxiola 456' }),
  calle2:  z.string().max(100).optional(),
  refer:   z.string().optional(),
  colonia: z.string().max(100).optional().openapi({ example: 'Centro' }),
  codPost: z.string().max(5).optional().openapi({ example: '81200' }),
  ciudad:  z.string().max(50).optional().openapi({ example: 'Los Mochis' }),
  estado:  z.string().max(50).optional().openapi({ example: 'Sinaloa' }),
  pais:    z.string().max(50).optional().openapi({ example: 'Mexico' }),
});

const ContactoSchema = z.object({
  numTel1: z.string().max(10).optional().openapi({ example: '6681234567' }),
  numTel2: z.string().max(10).optional(),
  correo:  z.string().email().optional().openapi({ example: 'empleado@correo.com' }),
});

const PreparacionSchema = z.object({
  estudiosPprof: z.string().max(200).optional().openapi({ example: 'Licenciatura en Matematicas' }),
  escuelaRealiz: z.string().max(200).optional().openapi({ example: 'UAS' }),
  tipoEstudio:   z.enum(['Titulado', 'Pasante', 'Diplomado']).optional(),
  ultimoGrado:   z.string().max(100).optional(),
  institucion:   z.string().max(200).optional(),
  especialidades: z.string().optional(),
});

export const CreateEmpleadoSchema = z.object({
  nombre:      z.string().max(50).openapi({ example: 'Juan' }),
  appP:        z.string().max(50).openapi({ example: 'Perez' }),
  appM:        z.string().max(50).optional().openapi({ example: 'Lopez' }),
  rfc:         z.string().max(13).openapi({ example: 'PELJ800101ABC' }),
  curp:        z.string().max(18).openapi({ example: 'PELJ800101HSLRPN01' }),
  lugarNac:    z.string().max(150).optional().openapi({ example: 'Los Mochis, Sinaloa' }),
  estadoCivil: z.string().max(20).optional().openapi({ example: 'Casado' }),
  fIngreso:    z.coerce.date().openapi({ example: '2010-08-16' }),
  direccion:   DireccionSchema.optional(),
  contacto:    ContactoSchema.optional(),
  preparacion: PreparacionSchema.optional(),
}).openapi('CreateEmpleado');

export const UpdateEmpleadoSchema = z.object({
  nombre:      z.string().max(50).optional(),
  appP:        z.string().max(50).optional(),
  appM:        z.string().max(50).optional(),
  rfc:         z.string().max(13).optional(),
  curp:        z.string().max(18).optional(),
  lugarNac:    z.string().max(150).optional(),
  estadoCivil: z.string().max(20).optional(),
  fIngreso:    z.coerce.date().optional(),
  direccion:   DireccionSchema.optional(),
  contacto:    ContactoSchema.optional(),
  preparacion: PreparacionSchema.optional(),
}).openapi('UpdateEmpleado');

export const EmpleadoResponseSchema = z.object({
  id:          z.string().uuid(),
  idPersona:   z.string().uuid(),
  idEsc:       z.string().uuid(),
  numControl:  z.string(),
  rfc:         z.string(),
  curp:        z.string(),
  lugarNac:    z.string().nullable(),
  estadoCivil: z.string().nullable(),
  fIngreso:    z.date(),
  activo:      z.boolean(),
  fCre:        z.date(),
  fMod:        z.date(),
}).openapi('EmpleadoResponse');

export type CreateEmpleadoDTO   = z.infer<typeof CreateEmpleadoSchema>;
export type UpdateEmpleadoDTO   = z.infer<typeof UpdateEmpleadoSchema>;
export type EmpleadoResponseDTO = z.infer<typeof EmpleadoResponseSchema>;

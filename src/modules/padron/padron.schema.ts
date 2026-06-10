import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const GenerarPadronSchema = z.object({
  idCiclo:       z.string().uuid().openapi({ example: 'uuid-del-ciclo' }),
  idEsc:         z.string().uuid().optional().openapi({ example: 'uuid-de-la-escuela' }),
  observaciones: z.string().max(800).optional().openapi({ example: 'Sin novedades relevantes.' }),
}).openapi('GenerarPadron');

export const GenerarReporteMaestrosSchema = z.object({
  idCiclo:      z.string().uuid().openapi({ example: 'uuid-del-ciclo' }),
  idEsc:        z.string().uuid().optional(),
  // Array de UUIDs o la cadena literal "todos"
  idEmpleados:  z.union([
    z.array(z.string().uuid()).min(1),
    z.literal('todos'),
  ]).openapi({ example: ['uuid-empleado-1', 'uuid-empleado-2'] }),
  observaciones: z.string().max(800).optional(),
}).openapi('GenerarReporteMaestros');

export const PadronResponseSchema = z.object({
  id:      z.string().uuid(),
  idCiclo: z.string().uuid(),
  idEsc:   z.string().uuid(),
  status:  z.string(),
  fGen:    z.date(),
  fMod:    z.date(),
}).openapi('PadronResponse');

export type GenerarPadronDTO          = z.infer<typeof GenerarPadronSchema>;
export type GenerarReporteMaestrosDTO = z.infer<typeof GenerarReporteMaestrosSchema>;
export type PadronResponseDTO         = z.infer<typeof PadronResponseSchema>;

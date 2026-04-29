import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

const diasSemana = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes'] as const;
const horaRegex  = /^\d{2}:\d{2}$/;

export const CreateHorarioSlotSchema = z.object({
  idGrupo:    z.string().uuid().openapi({ example: 'uuid-del-grupo' }),
  idMateria:  z.string().uuid().optional().openapi({ example: 'uuid-de-la-materia' }),
  idEmpleado: z.string().uuid().optional().openapi({ example: 'uuid-del-empleado' }),
  diaSemana:  z.enum(diasSemana).openapi({ example: 'Lunes' }),
  hInicio:    z.string().regex(horaRegex).openapi({ example: '07:00' }),
  hFin:       z.string().regex(horaRegex).openapi({ example: '08:00' }),
}).openapi('CreateHorarioSlot');

export const HorarioSlotResponseSchema = z.object({
  id:         z.string().uuid(),
  idEmpleado: z.string().uuid().nullable(),
  idGrupo:    z.string().uuid().nullable(),
  idMateria:  z.string().uuid().nullable(),
  diaSemana:  z.string(),
  hInicio:    z.string(),
  hFin:       z.string(),
  activo:     z.boolean(),
  fCre:       z.date(),
  fMod:       z.date(),
}).openapi('HorarioSlotResponse');

export type CreateHorarioSlotDTO   = z.infer<typeof CreateHorarioSlotSchema>;
export type HorarioSlotResponseDTO = z.infer<typeof HorarioSlotResponseSchema>;

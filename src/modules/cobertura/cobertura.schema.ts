import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const CreateCoberturaSchema = z.object({
  idEmpleadoTitular: z.string().uuid().openapi({ example: 'uuid-del-titular' }),
  idEmpleadoCubre:   z.string().uuid().openapi({ example: 'uuid-del-suplente' }),
  fInicio:           z.coerce.date().openapi({ example: '2024-09-01' }),
  motivo:            z.string().optional().openapi({ example: 'Incapacidad medica' }),
}).openapi('CreateCobertura');

export const CoberturaResponseSchema = z.object({
  id:                z.string().uuid(),
  idEmpleadoTitular: z.string().uuid(),
  idEmpleadoCubre:   z.string().uuid(),
  numControlTemp:    z.string(),
  fInicio:           z.date(),
  fFin:              z.date().nullable(),
  motivo:            z.string().nullable(),
  activo:            z.boolean(),
  fCre:              z.date(),
  fMod:              z.date(),
}).openapi('CoberturaResponse');

export type CreateCoberturaDTO   = z.infer<typeof CreateCoberturaSchema>;
export type CoberturaResponseDTO = z.infer<typeof CoberturaResponseSchema>;

import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const GenerarPadronSchema = z.object({
  idCiclo: z.string().uuid().openapi({ example: 'uuid-del-ciclo' }),
  // Requerido para admin y supervisor. El director lo toma del token.
  idEsc:   z.string().uuid().optional().openapi({ example: 'uuid-de-la-escuela' }),
}).openapi('GenerarPadron');

export const PadronResponseSchema = z.object({
  id:      z.string().uuid(),
  idCiclo: z.string().uuid(),
  idEsc:   z.string().uuid(),
  status:  z.string(),
  fGen:    z.date(),
  fMod:    z.date(),
}).openapi('PadronResponse');

export type GenerarPadronDTO   = z.infer<typeof GenerarPadronSchema>;
export type PadronResponseDTO  = z.infer<typeof PadronResponseSchema>;
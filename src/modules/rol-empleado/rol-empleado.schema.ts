import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const RolEmpleadoResponseSchema = z.object({
  id:     z.string().uuid(),
  nombre: z.string(),
  desc:   z.string().nullable(),
  activo: z.boolean(),
  fCre:   z.date(),
  fMod:   z.date(),
}).openapi('RolEmpleadoResponse');

export type RolEmpleadoResponseDTO = z.infer<typeof RolEmpleadoResponseSchema>;
import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const CreateMateriaSchema = z.object({
  idPlan: z.string().uuid().openapi({ example: 'uuid-del-plan' }),
  nombre: z.string().max(100).openapi({ example: 'Matematicas' }),
  desc:   z.string().optional(),
}).openapi('CreateMateria');

export const UpdateMateriaSchema = z.object({
  nombre: z.string().max(100).optional().openapi({ example: 'Matematicas Actualizado' }),
  desc:   z.string().optional(),
}).openapi('UpdateMateria');

export const MateriaResponseSchema = z.object({
  id:     z.string().uuid(),
  idPlan: z.string().uuid(),
  nombre: z.string(),
  desc:   z.string().nullable(),
  activo: z.boolean(),
  fCre:   z.date(),
  fMod:   z.date(),
}).openapi('MateriaResponse');

export type CreateMateriaDTO   = z.infer<typeof CreateMateriaSchema>;
export type UpdateMateriaDTO   = z.infer<typeof UpdateMateriaSchema>;
export type MateriaResponseDTO = z.infer<typeof MateriaResponseSchema>;
import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const CreatePlanEstudiosSchema = z.object({
  nombre: z.string().max(20).openapi({ example: 'Plan 2022' }),
  desc:   z.string().optional().openapi({ example: 'Plan de estudios 2022' }),
  grados: z.array(z.object({
    nombre: z.string().max(25).openapi({ example: 'Primer Grado' }),
    numero: z.number().int().positive().openapi({ example: 1 }),
  })).min(1).openapi({ example: [{ nombre: 'Primer Grado', numero: 1 }] }),
  materias: z.array(z.object({
    nombre: z.string().max(100).openapi({ example: 'Matematicas' }),
    desc:   z.string().optional(),
  })).min(1).openapi({ example: [{ nombre: 'Matematicas' }] }),
}).openapi('CreatePlanEstudios');

// Al editar solo se permite cambiar nombre y desc
export const UpdatePlanEstudiosSchema = z.object({
  nombre: z.string().max(20).optional().openapi({ example: 'Plan 2022 Actualizado' }),
  desc:   z.string().optional(),
}).openapi('UpdatePlanEstudios');

export const PlanEstudiosResponseSchema = z.object({
  id:     z.string().uuid(),
  nombre: z.string(),
  desc:   z.string().nullable(),
  actual: z.boolean(),
  activo: z.boolean(),
  fCre:   z.date(),
  fMod:   z.date(),
}).openapi('PlanEstudiosResponse');

export type CreatePlanEstudiosDTO   = z.infer<typeof CreatePlanEstudiosSchema>;
export type UpdatePlanEstudiosDTO   = z.infer<typeof UpdatePlanEstudiosSchema>;
export type PlanEstudiosResponseDTO = z.infer<typeof PlanEstudiosResponseSchema>;
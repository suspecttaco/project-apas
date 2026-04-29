import { z } from 'zod';
import { OpenApiGeneratorV3, OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { LoginSupervisorSchema, LoginDirectorSchema, TokenResponseSchema } from '../modules/auth/auth.schema';
import { CreateEscuelaSchema, UpdateEscuelaSchema, EscuelaResponseSchema } from '../modules/escuela/escuela.schema';
import { PlanEstudiosResponseSchema } from '../modules/plan-estudios/plan-estudios.schema';
import { GradoResponseSchema }        from '../modules/grado/grado.schema';
import { MateriaResponseSchema }       from '../modules/materia/materia.schema';
import { NombramientoResponseSchema }  from '../modules/nombramiento/nombramiento.schema';
import { RolEmpleadoResponseSchema }   from '../modules/rol-empleado/rol-empleado.schema';

export const registry = new OpenAPIRegistry();

registry.registerComponent('securitySchemes', 'bearerAuth', {
  type:         'http',
  scheme:       'bearer',
  bearerFormat: 'JWT',
});

registry.registerPath({
  method:  'post',
  path:    '/auth/supervisor/login',
  tags:    ['Auth'],
  request: { body: { content: { 'application/json': { schema: LoginSupervisorSchema } } } },
  responses: {
    200: { description: 'Login exitoso',          content: { 'application/json': { schema: TokenResponseSchema } } },
    401: { description: 'Credenciales invalidas' },
  },
});

registry.registerPath({
  method:  'post',
  path:    '/auth/director/login',
  tags:    ['Auth'],
  request: { body: { content: { 'application/json': { schema: LoginDirectorSchema } } } },
  responses: {
    200: { description: 'Login exitoso',          content: { 'application/json': { schema: TokenResponseSchema } } },
    401: { description: 'Credenciales invalidas' },
  },
});

registry.registerPath({
  method:   'get',
  path:     '/supervisor/escuelas',
  tags:     ['Escuelas'],
  security: [{ bearerAuth: [] }],
  responses: {
    200: { description: 'Lista de escuelas', content: { 'application/json': { schema: EscuelaResponseSchema } } },
  },
});

registry.registerPath({
  method:   'get',
  path:     '/supervisor/escuelas/{id}',
  tags:     ['Escuelas'],
  security: [{ bearerAuth: [] }],
  request:  { params: z.object({ id: z.string().uuid() }) },
  responses: {
    200: { description: 'Escuela encontrada', content: { 'application/json': { schema: EscuelaResponseSchema } } },
    404: { description: 'Escuela no encontrada' },
  },
});

registry.registerPath({
  method:   'post',
  path:     '/supervisor/escuelas',
  tags:     ['Escuelas'],
  security: [{ bearerAuth: [] }],
  request:  { body: { content: { 'application/json': { schema: CreateEscuelaSchema } } } },
  responses: {
    201: { description: 'Escuela creada',    content: { 'application/json': { schema: EscuelaResponseSchema } } },
    409: { description: 'Clave duplicada' },
  },
});

registry.registerPath({
  method:   'put',
  path:     '/supervisor/escuelas/{id}',
  tags:     ['Escuelas'],
  security: [{ bearerAuth: [] }],
  request:  {
    params: z.object({ id: z.string().uuid() }),
    body:   { content: { 'application/json': { schema: UpdateEscuelaSchema } } },
  },
  responses: {
    200: { description: 'Escuela actualizada',   content: { 'application/json': { schema: EscuelaResponseSchema } } },
    404: { description: 'Escuela no encontrada' },
  },
});

registry.registerPath({
  method:   'delete',
  path:     '/supervisor/escuelas/{id}',
  tags:     ['Escuelas'],
  security: [{ bearerAuth: [] }],
  request:  { params: z.object({ id: z.string().uuid() }) },
  responses: {
    204: { description: 'Escuela eliminada' },
    404: { description: 'Escuela no encontrada' },
  },
});

// Plan de estudios
registry.registerPath({
  method:   'get',
  path:     '/plan-estudios',
  tags:     ['Plan de Estudios'],
  security: [{ bearerAuth: [] }],
  responses: { 200: { description: 'Lista de planes de estudio', content: { 'application/json': { schema: PlanEstudiosResponseSchema } } } },
});
registry.registerPath({
  method:   'get',
  path:     '/plan-estudios/{id}',
  tags:     ['Plan de Estudios'],
  security: [{ bearerAuth: [] }],
  request:  { params: z.object({ id: z.string() }) },
  responses: {
    200: { description: 'Plan de estudios encontrado', content: { 'application/json': { schema: PlanEstudiosResponseSchema } } },
    404: { description: 'Plan de estudios no encontrado' },
  },
});

// Grados
registry.registerPath({
  method:   'get',
  path:     '/grados',
  tags:     ['Grados'],
  security: [{ bearerAuth: [] }],
  responses: { 200: { description: 'Lista de grados', content: { 'application/json': { schema: GradoResponseSchema } } } },
});
registry.registerPath({
  method:   'get',
  path:     '/grados/{id}',
  tags:     ['Grados'],
  security: [{ bearerAuth: [] }],
  request:  { params: z.object({ id: z.string() }) },
  responses: {
    200: { description: 'Grado encontrado', content: { 'application/json': { schema: GradoResponseSchema } } },
    404: { description: 'Grado no encontrado' },
  },
});

// Materias
registry.registerPath({
  method:   'get',
  path:     '/materias',
  tags:     ['Materias'],
  security: [{ bearerAuth: [] }],
  responses: { 200: { description: 'Lista de materias', content: { 'application/json': { schema: MateriaResponseSchema } } } },
});
registry.registerPath({
  method:   'get',
  path:     '/materias/{id}',
  tags:     ['Materias'],
  security: [{ bearerAuth: [] }],
  request:  { params: z.object({ id: z.string() }) },
  responses: {
    200: { description: 'Materia encontrada', content: { 'application/json': { schema: MateriaResponseSchema } } },
    404: { description: 'Materia no encontrada' },
  },
});

// Nombramientos
registry.registerPath({
  method:   'get',
  path:     '/nombramientos',
  tags:     ['Nombramientos'],
  security: [{ bearerAuth: [] }],
  responses: { 200: { description: 'Lista de nombramientos', content: { 'application/json': { schema: NombramientoResponseSchema } } } },
});
registry.registerPath({
  method:   'get',
  path:     '/nombramientos/{id}',
  tags:     ['Nombramientos'],
  security: [{ bearerAuth: [] }],
  request:  { params: z.object({ id: z.string() }) },
  responses: {
    200: { description: 'Nombramiento encontrado', content: { 'application/json': { schema: NombramientoResponseSchema } } },
    404: { description: 'Nombramiento no encontrado' },
  },
});

// Roles de empleado
registry.registerPath({
  method:   'get',
  path:     '/roles-empleado',
  tags:     ['Roles Empleado'],
  security: [{ bearerAuth: [] }],
  responses: { 200: { description: 'Lista de roles', content: { 'application/json': { schema: RolEmpleadoResponseSchema } } } },
});
registry.registerPath({
  method:   'get',
  path:     '/roles-empleado/{id}',
  tags:     ['Roles Empleado'],
  security: [{ bearerAuth: [] }],
  request:  { params: z.object({ id: z.string() }) },
  responses: {
    200: { description: 'Rol encontrado', content: { 'application/json': { schema: RolEmpleadoResponseSchema } } },
    404: { description: 'Rol no encontrado' },
  },
});

export function generateOpenApiSpec() {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title:       'Padron SEPyC API',
      version:     '1.0.0',
      description: 'API para el sistema de Padron de Estructura Ocupacional Intermedia - SEPyC Sinaloa',
    },
    servers: [{ url: '/api' }],
  });
}
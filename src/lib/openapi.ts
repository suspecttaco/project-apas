import { OpenApiGeneratorV3, OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { LoginSupervisorSchema, LoginDirectorSchema, TokenResponseSchema } from '../modules/auth/auth.schema';
import { CreateEscuelaSchema, UpdateEscuelaSchema, EscuelaResponseSchema } from '../modules/escuela/escuela.schema';

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
    200: { description: 'Login exitoso', content: { 'application/json': { schema: TokenResponseSchema } } },
    401: { description: 'Credenciales invalidas' },
  },
});

registry.registerPath({
  method:  'post',
  path:    '/auth/director/login',
  tags:    ['Auth'],
  request: { body: { content: { 'application/json': { schema: LoginDirectorSchema } } } },
  responses: {
    200: { description: 'Login exitoso', content: { 'application/json': { schema: TokenResponseSchema } } },
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
  method:   'post',
  path:     '/supervisor/escuelas',
  tags:     ['Escuelas'],
  security: [{ bearerAuth: [] }],
  request:  { body: { content: { 'application/json': { schema: CreateEscuelaSchema } } } },
  responses: {
    201: { description: 'Escuela creada', content: { 'application/json': { schema: EscuelaResponseSchema } } },
    409: { description: 'Clave duplicada' },
  },
});

registry.registerPath({
  method:   'put',
  path:     '/supervisor/escuelas/{id}',
  tags:     ['Escuelas'],
  security: [{ bearerAuth: [] }],
  request:  {
    params: { id: { in: 'path', required: true, schema: { type: 'string' } } } as any,
    body:   { content: { 'application/json': { schema: UpdateEscuelaSchema } } },
  },
  responses: {
    200: { description: 'Escuela actualizada', content: { 'application/json': { schema: EscuelaResponseSchema } } },
    404: { description: 'Escuela no encontrada' },
  },
});

registry.registerPath({
  method:   'delete',
  path:     '/supervisor/escuelas/{id}',
  tags:     ['Escuelas'],
  security: [{ bearerAuth: [] }],
  request:  {
    params: { id: { in: 'path', required: true, schema: { type: 'string' } } } as any,
  },
  responses: {
    204: { description: 'Escuela eliminada' },
    404: { description: 'Escuela no encontrada' },
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
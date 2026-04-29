import { z } from 'zod';
import { OpenApiGeneratorV3, OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { LoginSupervisorSchema, LoginDirectorSchema, TokenResponseSchema } from '../modules/auth/auth.schema';
import { CreateEscuelaSchema, UpdateEscuelaSchema, EscuelaResponseSchema } from '../modules/escuela/escuela.schema';
import { PlanEstudiosResponseSchema } from '../modules/plan-estudios/plan-estudios.schema';
import { GradoResponseSchema }        from '../modules/grado/grado.schema';
import { MateriaResponseSchema }       from '../modules/materia/materia.schema';
import { NombramientoResponseSchema }  from '../modules/nombramiento/nombramiento.schema';
import { RolEmpleadoResponseSchema }   from '../modules/rol-empleado/rol-empleado.schema';
import { CreateCicloSchema, UpdateCicloSchema, CicloResponseSchema } from '../modules/ciclo/ciclo.schema';
import { CreateTurnoSchema, UpdateTurnoSchema, TurnoResponseSchema } from '../modules/turno/turno.schema';
import { CreateGrupoSchema, UpdateGrupoSchema, GrupoResponseSchema }       from '../modules/grupo/grupo.schema';
import { CreateEmpleadoSchema, UpdateEmpleadoSchema, EmpleadoResponseSchema } from '../modules/empleado/empleado.schema';
import { CreateCoberturaSchema, CoberturaResponseSchema }       from '../modules/cobertura/cobertura.schema';
import { CreatePlazaSchema, UpdatePlazaSchema, PlazaResponseSchema } from '../modules/plaza/plaza.schema';

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

// Ciclos
registry.registerPath({
  method:   'get',
  path:     '/director/ciclos',
  tags:     ['Ciclos'],
  security: [{ bearerAuth: [] }],
  responses: { 200: { description: 'Lista de ciclos', content: { 'application/json': { schema: CicloResponseSchema } } } },
});
registry.registerPath({
  method:   'get',
  path:     '/director/ciclos/{id}',
  tags:     ['Ciclos'],
  security: [{ bearerAuth: [] }],
  request:  { params: z.object({ id: z.string() }) },
  responses: {
    200: { description: 'Ciclo encontrado', content: { 'application/json': { schema: CicloResponseSchema } } },
    404: { description: 'Ciclo no encontrado' },
  },
});
registry.registerPath({
  method:   'post',
  path:     '/director/ciclos',
  tags:     ['Ciclos'],
  security: [{ bearerAuth: [] }],
  request:  { body: { content: { 'application/json': { schema: CreateCicloSchema } } } },
  responses: {
    201: { description: 'Ciclo creado',    content: { 'application/json': { schema: CicloResponseSchema } } },
    409: { description: 'Nombre duplicado' },
  },
});
registry.registerPath({
  method:   'put',
  path:     '/director/ciclos/{id}',
  tags:     ['Ciclos'],
  security: [{ bearerAuth: [] }],
  request:  {
    params: z.object({ id: z.string() }),
    body:   { content: { 'application/json': { schema: UpdateCicloSchema } } },
  },
  responses: {
    200: { description: 'Ciclo actualizado', content: { 'application/json': { schema: CicloResponseSchema } } },
    404: { description: 'Ciclo no encontrado' },
  },
});
registry.registerPath({
  method:   'delete',
  path:     '/director/ciclos/{id}',
  tags:     ['Ciclos'],
  security: [{ bearerAuth: [] }],
  request:  { params: z.object({ id: z.string() }) },
  responses: {
    204: { description: 'Ciclo eliminado' },
    404: { description: 'Ciclo no encontrado' },
    409: { description: 'No se puede eliminar el ciclo activo' },
  },
});
registry.registerPath({
  method:   'put',
  path:     '/director/ciclos/{id}/activar',
  tags:     ['Ciclos'],
  security: [{ bearerAuth: [] }],
  request:  { params: z.object({ id: z.string() }) },
  responses: {
    200: { description: 'Ciclo activado', content: { 'application/json': { schema: CicloResponseSchema } } },
    404: { description: 'Ciclo no encontrado' },
  },
});

// Plazas
registry.registerPath({
  method:   'get',
  path:     '/director/plazas',
  tags:     ['Plazas'],
  security: [{ bearerAuth: [] }],
  responses: { 200: { description: 'Lista de plazas', content: { 'application/json': { schema: PlazaResponseSchema } } } },
});
registry.registerPath({
  method:   'get',
  path:     '/director/plazas/{id}',
  tags:     ['Plazas'],
  security: [{ bearerAuth: [] }],
  request:  { params: z.object({ id: z.string() }) },
  responses: {
    200: { description: 'Plaza encontrada', content: { 'application/json': { schema: PlazaResponseSchema } } },
    404: { description: 'Plaza no encontrada' },
  },
});
registry.registerPath({
  method:   'post',
  path:     '/director/plazas',
  tags:     ['Plazas'],
  security: [{ bearerAuth: [] }],
  request:  { body: { content: { 'application/json': { schema: CreatePlazaSchema } } } },
  responses: {
    201: { description: 'Plaza creada',    content: { 'application/json': { schema: PlazaResponseSchema } } },
    409: { description: 'Codigo de plaza duplicado' },
  },
});
registry.registerPath({
  method:   'put',
  path:     '/director/plazas/{id}',
  tags:     ['Plazas'],
  security: [{ bearerAuth: [] }],
  request:  {
    params: z.object({ id: z.string() }),
    body:   { content: { 'application/json': { schema: UpdatePlazaSchema } } },
  },
  responses: {
    200: { description: 'Plaza actualizada', content: { 'application/json': { schema: PlazaResponseSchema } } },
    404: { description: 'Plaza no encontrada' },
  },
});
registry.registerPath({
  method:   'delete',
  path:     '/director/plazas/{id}',
  tags:     ['Plazas'],
  security: [{ bearerAuth: [] }],
  request:  { params: z.object({ id: z.string() }) },
  responses: {
    204: { description: 'Plaza eliminada' },
    404: { description: 'Plaza no encontrada' },
  },
});

// Coberturas
registry.registerPath({
  method:   'get',
  path:     '/director/coberturas',
  tags:     ['Coberturas'],
  security: [{ bearerAuth: [] }],
  responses: { 200: { description: 'Lista de coberturas', content: { 'application/json': { schema: CoberturaResponseSchema } } } },
});
registry.registerPath({
  method:   'get',
  path:     '/director/coberturas/{id}',
  tags:     ['Coberturas'],
  security: [{ bearerAuth: [] }],
  request:  { params: z.object({ id: z.string() }) },
  responses: {
    200: { description: 'Cobertura encontrada', content: { 'application/json': { schema: CoberturaResponseSchema } } },
    404: { description: 'Cobertura no encontrada' },
  },
});
registry.registerPath({
  method:   'post',
  path:     '/director/coberturas',
  tags:     ['Coberturas'],
  security: [{ bearerAuth: [] }],
  request:  { body: { content: { 'application/json': { schema: CreateCoberturaSchema } } } },
  responses: {
    201: { description: 'Cobertura abierta',   content: { 'application/json': { schema: CoberturaResponseSchema } } },
    409: { description: 'Suplente ya tiene cobertura activa' },
  },
});
registry.registerPath({
  method:   'put',
  path:     '/director/coberturas/{id}/cerrar',
  tags:     ['Coberturas'],
  security: [{ bearerAuth: [] }],
  request:  { params: z.object({ id: z.string() }) },
  responses: {
    200: { description: 'Cobertura cerrada', content: { 'application/json': { schema: CoberturaResponseSchema } } },
    404: { description: 'Cobertura no encontrada' },
    409: { description: 'La cobertura ya esta cerrada' },
  },
});

// Empleados
registry.registerPath({
  method:   'get',
  path:     '/director/empleados',
  tags:     ['Empleados'],
  security: [{ bearerAuth: [] }],
  responses: { 200: { description: 'Lista de empleados', content: { 'application/json': { schema: EmpleadoResponseSchema } } } },
});
registry.registerPath({
  method:   'get',
  path:     '/director/empleados/{id}',
  tags:     ['Empleados'],
  security: [{ bearerAuth: [] }],
  request:  { params: z.object({ id: z.string() }) },
  responses: {
    200: { description: 'Empleado encontrado', content: { 'application/json': { schema: EmpleadoResponseSchema } } },
    404: { description: 'Empleado no encontrado' },
  },
});
registry.registerPath({
  method:   'post',
  path:     '/director/empleados',
  tags:     ['Empleados'],
  security: [{ bearerAuth: [] }],
  request:  { body: { content: { 'application/json': { schema: CreateEmpleadoSchema } } } },
  responses: {
    201: { description: 'Empleado creado',    content: { 'application/json': { schema: EmpleadoResponseSchema } } },
    409: { description: 'RFC o CURP duplicado' },
  },
});
registry.registerPath({
  method:   'put',
  path:     '/director/empleados/{id}',
  tags:     ['Empleados'],
  security: [{ bearerAuth: [] }],
  request:  {
    params: z.object({ id: z.string() }),
    body:   { content: { 'application/json': { schema: UpdateEmpleadoSchema } } },
  },
  responses: {
    200: { description: 'Empleado actualizado', content: { 'application/json': { schema: EmpleadoResponseSchema } } },
    404: { description: 'Empleado no encontrado' },
  },
});
registry.registerPath({
  method:   'delete',
  path:     '/director/empleados/{id}',
  tags:     ['Empleados'],
  security: [{ bearerAuth: [] }],
  request:  { params: z.object({ id: z.string() }) },
  responses: {
    204: { description: 'Empleado eliminado' },
    404: { description: 'Empleado no encontrado' },
  },
});

// Grupos
registry.registerPath({
  method:   'get',
  path:     '/director/grupos',
  tags:     ['Grupos'],
  security: [{ bearerAuth: [] }],
  responses: { 200: { description: 'Lista de grupos', content: { 'application/json': { schema: GrupoResponseSchema } } } },
});
registry.registerPath({
  method:   'get',
  path:     '/director/grupos/{id}',
  tags:     ['Grupos'],
  security: [{ bearerAuth: [] }],
  request:  { params: z.object({ id: z.string() }) },
  responses: {
    200: { description: 'Grupo encontrado', content: { 'application/json': { schema: GrupoResponseSchema } } },
    404: { description: 'Grupo no encontrado' },
  },
});
registry.registerPath({
  method:   'post',
  path:     '/director/grupos',
  tags:     ['Grupos'],
  security: [{ bearerAuth: [] }],
  request:  { body: { content: { 'application/json': { schema: CreateGrupoSchema } } } },
  responses: {
    201: { description: 'Grupo creado',    content: { 'application/json': { schema: GrupoResponseSchema } } },
    409: { description: 'Grupo duplicado' },
  },
});
registry.registerPath({
  method:   'put',
  path:     '/director/grupos/{id}',
  tags:     ['Grupos'],
  security: [{ bearerAuth: [] }],
  request:  {
    params: z.object({ id: z.string() }),
    body:   { content: { 'application/json': { schema: UpdateGrupoSchema } } },
  },
  responses: {
    200: { description: 'Grupo actualizado', content: { 'application/json': { schema: GrupoResponseSchema } } },
    404: { description: 'Grupo no encontrado' },
  },
});
registry.registerPath({
  method:   'delete',
  path:     '/director/grupos/{id}',
  tags:     ['Grupos'],
  security: [{ bearerAuth: [] }],
  request:  { params: z.object({ id: z.string() }) },
  responses: {
    204: { description: 'Grupo eliminado' },
    404: { description: 'Grupo no encontrado' },
  },
});

// Turnos
registry.registerPath({
  method:   'get',
  path:     '/director/turnos',
  tags:     ['Turnos'],
  security: [{ bearerAuth: [] }],
  responses: { 200: { description: 'Lista de turnos', content: { 'application/json': { schema: TurnoResponseSchema } } } },
});
registry.registerPath({
  method:   'get',
  path:     '/director/turnos/{id}',
  tags:     ['Turnos'],
  security: [{ bearerAuth: [] }],
  request:  { params: z.object({ id: z.string() }) },
  responses: {
    200: { description: 'Turno encontrado', content: { 'application/json': { schema: TurnoResponseSchema } } },
    404: { description: 'Turno no encontrado' },
  },
});
registry.registerPath({
  method:   'post',
  path:     '/director/turnos',
  tags:     ['Turnos'],
  security: [{ bearerAuth: [] }],
  request:  { body: { content: { 'application/json': { schema: CreateTurnoSchema } } } },
  responses: {
    201: { description: 'Turno creado',    content: { 'application/json': { schema: TurnoResponseSchema } } },
    409: { description: 'Nombre duplicado' },
  },
});
registry.registerPath({
  method:   'put',
  path:     '/director/turnos/{id}',
  tags:     ['Turnos'],
  security: [{ bearerAuth: [] }],
  request:  {
    params: z.object({ id: z.string() }),
    body:   { content: { 'application/json': { schema: UpdateTurnoSchema } } },
  },
  responses: {
    200: { description: 'Turno actualizado', content: { 'application/json': { schema: TurnoResponseSchema } } },
    404: { description: 'Turno no encontrado' },
  },
});
registry.registerPath({
  method:   'delete',
  path:     '/director/turnos/{id}',
  tags:     ['Turnos'],
  security: [{ bearerAuth: [] }],
  request:  { params: z.object({ id: z.string() }) },
  responses: {
    204: { description: 'Turno eliminado' },
    404: { description: 'Turno no encontrado' },
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
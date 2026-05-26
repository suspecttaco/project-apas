import { z } from 'zod';
import { OpenApiGeneratorV3, OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { LoginSchema, TokenResponseSchema } from '../modules/auth/auth.schema';
import { CreateEscuelaSchema, UpdateEscuelaSchema, EscuelaResponseSchema } from '../modules/escuela/escuela.schema';
import { CreatePlanEstudiosSchema, UpdatePlanEstudiosSchema, PlanEstudiosResponseSchema } from '../modules/plan-estudios/plan-estudios.schema';
import { CreateGradoSchema, UpdateGradoSchema, GradoResponseSchema }        from '../modules/grado/grado.schema';
import { CreateMateriaSchema, UpdateMateriaSchema, MateriaResponseSchema }   from '../modules/materia/materia.schema';
import { CreateNombramientoSchema, UpdateNombramientoSchema, NombramientoResponseSchema }  from '../modules/nombramiento/nombramiento.schema';
import { CreateRolEmpleadoSchema, UpdateRolEmpleadoSchema, RolEmpleadoResponseSchema }   from '../modules/rol-empleado/rol-empleado.schema';
import { CreateCicloSchema, UpdateCicloSchema, CicloResponseSchema } from '../modules/ciclo/ciclo.schema';
import { CreateTurnoSchema, UpdateTurnoSchema, TurnoResponseSchema } from '../modules/turno/turno.schema';
import { CreateGrupoSchema, UpdateGrupoSchema, GrupoResponseSchema }       from '../modules/grupo/grupo.schema';
import { CreateEmpleadoSchema, UpdateEmpleadoSchema, EmpleadoResponseSchema } from '../modules/empleado/empleado.schema';
import { CreateCoberturaSchema, CoberturaResponseSchema }       from '../modules/cobertura/cobertura.schema';
import { CreatePlazaSchema, UpdatePlazaSchema, PlazaResponseSchema }       from '../modules/plaza/plaza.schema';
import { CreateHorarioSlotSchema, HorarioSlotResponseSchema }                   from '../modules/horario/horario.schema';
import { UpdateEstadisticaSchema, EstadisticaResponseSchema }   from '../modules/estadistica/estadistica.schema';
import { GenerarPadronSchema, PadronResponseSchema }           from '../modules/padron/padron.schema';
import { CreateUsuarioSchema, UpdateUsuarioSchema, UsuarioResponseSchema } from '../modules/usuario/usuario.schema';
import { CreateRolSchema, UpdateRolSchema, AsignarPermisosSchema, RolResponseSchema } from '../modules/rol/rol.schema';
import { CreatePermisoSchema, UpdatePermisoSchema, PermisoResponseSchema } from '../modules/permiso/permiso.schema';

export const registry = new OpenAPIRegistry();

registry.registerComponent('securitySchemes', 'bearerAuth', {
  type:         'http',
  scheme:       'bearer',
  bearerFormat: 'JWT',
});

registry.registerPath({
  method:  'post',
  path:    '/auth/login',
  tags:    ['Auth'],
  request: { body: { content: { 'application/json': { schema: LoginSchema } } } },
  responses: {
    200: { description: 'Login exitoso',          content: { 'application/json': { schema: TokenResponseSchema } } },
    401: { description: 'Credenciales invalidas o sin escuela asignada' },
  },
});

registry.registerPath({
  method:   'get',
  path:     '/escuelas',
  tags:     ['Escuelas'],
  security: [{ bearerAuth: [] }],
  responses: {
    200: { description: 'Lista de escuelas', content: { 'application/json': { schema: EscuelaResponseSchema } } },
  },
});

registry.registerPath({
  method:   'get',
  path:     '/escuelas/{id}',
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
  path:     '/escuelas',
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
  path:     '/escuelas/{id}',
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
  path:     '/escuelas/{id}',
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
  path:     '/ciclos',
  tags:     ['Ciclos'],
  security: [{ bearerAuth: [] }],
  responses: { 200: { description: 'Lista de ciclos', content: { 'application/json': { schema: CicloResponseSchema } } } },
});
registry.registerPath({
  method:   'get',
  path:     '/ciclos/{id}',
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
  path:     '/ciclos',
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
  path:     '/ciclos/{id}',
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
  path:     '/ciclos/{id}',
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
  path:     '/ciclos/{id}/activar',
  tags:     ['Ciclos'],
  security: [{ bearerAuth: [] }],
  request:  { params: z.object({ id: z.string() }) },
  responses: {
    200: { description: 'Ciclo activado', content: { 'application/json': { schema: CicloResponseSchema } } },
    404: { description: 'Ciclo no encontrado' },
  },
});

// Padron
registry.registerPath({
  method:   'post',
  path:     '/padron/generar',
  tags:     ['Padron'],
  security: [{ bearerAuth: [] }],
  request:  { body: { content: { 'application/json': { schema: GenerarPadronSchema } } } },
  responses: {
    200: { description: 'PDF del padron generado (application/pdf)' },
    400: { description: 'Falta idEsc en el body (requerido para admin y supervisor)' },
    404: { description: 'Ciclo o escuela no encontrados' },
  },
});
registry.registerPath({
  method:   'get',
  path:     '/padron/historial',
  tags:     ['Padron'],
  security: [{ bearerAuth: [] }],
  request: {
    query: z.object({
      idEsc: z.string().uuid().optional().openapi({
        description: 'Requerido para admin y supervisor. El director lo toma del token.',
        example: 'uuid-de-la-escuela',
      }),
    }),
  },
  responses: {
    200: { description: 'Historial de padrones generados', content: { 'application/json': { schema: PadronResponseSchema } } },
    400: { description: 'Falta idEsc para roles sin escuela asignada en token' },
  },
});

// Estadisticas
registry.registerPath({
  method:   'get',
  path:     '/estadisticas',
  tags:     ['Estadisticas'],
  security: [{ bearerAuth: [] }],
  responses: { 200: { description: 'Lista de estadisticas', content: { 'application/json': { schema: EstadisticaResponseSchema } } } },
});
registry.registerPath({
  method:   'get',
  path:     '/estadisticas/{id}',
  tags:     ['Estadisticas'],
  security: [{ bearerAuth: [] }],
  request:  { params: z.object({ id: z.string() }) },
  responses: {
    200: { description: 'Estadistica encontrada', content: { 'application/json': { schema: EstadisticaResponseSchema } } },
    404: { description: 'Estadistica no encontrada' },
  },
});
registry.registerPath({
  method:   'put',
  path:     '/estadisticas/{id}',
  tags:     ['Estadisticas'],
  security: [{ bearerAuth: [] }],
  request:  {
    params: z.object({ id: z.string() }),
    body:   { content: { 'application/json': { schema: UpdateEstadisticaSchema } } },
  },
  responses: {
    200: { description: 'Estadistica actualizada', content: { 'application/json': { schema: EstadisticaResponseSchema } } },
    404: { description: 'Estadistica no encontrada' },
  },
});

// Horarios
registry.registerPath({
  method:   'get',
  path:     '/horarios/empleado/{idEmpleado}',
  tags:     ['Horarios'],
  security: [{ bearerAuth: [] }],
  request:  { params: z.object({ idEmpleado: z.string() }) },
  responses: {
    200: { description: 'Horario del empleado', content: { 'application/json': { schema: HorarioSlotResponseSchema } } },
    404: { description: 'Empleado no encontrado' },
  },
});
registry.registerPath({
  method:   'get',
  path:     '/horarios/grupo/{idGrupo}',
  tags:     ['Horarios'],
  security: [{ bearerAuth: [] }],
  request:  { params: z.object({ idGrupo: z.string() }) },
  responses: {
    200: { description: 'Horario del grupo', content: { 'application/json': { schema: HorarioSlotResponseSchema } } },
    404: { description: 'Grupo no encontrado' },
  },
});
registry.registerPath({
  method:   'post',
  path:     '/horarios',
  tags:     ['Horarios'],
  security: [{ bearerAuth: [] }],
  request:  { body: { content: { 'application/json': { schema: CreateHorarioSlotSchema } } } },
  responses: {
    201: { description: 'Slot creado',   content: { 'application/json': { schema: HorarioSlotResponseSchema } } },
    409: { description: 'Slot duplicado en ese grupo, dia y hora' },
  },
});
registry.registerPath({
  method:   'delete',
  path:     '/horarios/{id}',
  tags:     ['Horarios'],
  security: [{ bearerAuth: [] }],
  request:  { params: z.object({ id: z.string() }) },
  responses: {
    204: { description: 'Slot eliminado' },
    404: { description: 'Slot no encontrado' },
  },
});

// Plazas
registry.registerPath({
  method:   'get',
  path:     '/plazas',
  tags:     ['Plazas'],
  security: [{ bearerAuth: [] }],
  responses: { 200: { description: 'Lista de plazas', content: { 'application/json': { schema: PlazaResponseSchema } } } },
});
registry.registerPath({
  method:   'get',
  path:     '/plazas/{id}',
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
  path:     '/plazas',
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
  path:     '/plazas/{id}',
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
  path:     '/plazas/{id}',
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
  path:     '/coberturas',
  tags:     ['Coberturas'],
  security: [{ bearerAuth: [] }],
  responses: { 200: { description: 'Lista de coberturas', content: { 'application/json': { schema: CoberturaResponseSchema } } } },
});
registry.registerPath({
  method:   'get',
  path:     '/coberturas/{id}',
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
  path:     '/coberturas',
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
  path:     '/coberturas/{id}/cerrar',
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
  path:     '/empleados',
  tags:     ['Empleados'],
  security: [{ bearerAuth: [] }],
  responses: { 200: { description: 'Lista de empleados', content: { 'application/json': { schema: EmpleadoResponseSchema } } } },
});
registry.registerPath({
  method:   'get',
  path:     '/empleados/{id}',
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
  path:     '/empleados',
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
  path:     '/empleados/{id}',
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
  path:     '/empleados/{id}',
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
  path:     '/grupos',
  tags:     ['Grupos'],
  security: [{ bearerAuth: [] }],
  responses: { 200: { description: 'Lista de grupos', content: { 'application/json': { schema: GrupoResponseSchema } } } },
});
registry.registerPath({
  method:   'get',
  path:     '/grupos/{id}',
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
  path:     '/grupos',
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
  path:     '/grupos/{id}',
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
  path:     '/grupos/{id}',
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
  path:     '/turnos',
  tags:     ['Turnos'],
  security: [{ bearerAuth: [] }],
  responses: { 200: { description: 'Lista de turnos', content: { 'application/json': { schema: TurnoResponseSchema } } } },
});
registry.registerPath({
  method:   'get',
  path:     '/turnos/{id}',
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
  path:     '/turnos',
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
  path:     '/turnos/{id}',
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
  path:     '/turnos/{id}',
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
registry.registerPath({
  method:   'post',
  path:     '/plan-estudios',
  tags:     ['Plan de Estudios'],
  security: [{ bearerAuth: [] }],
  request:  { body: { content: { 'application/json': { schema: CreatePlanEstudiosSchema } } } },
  responses: {
    201: { description: 'Plan creado', content: { 'application/json': { schema: PlanEstudiosResponseSchema } } },
    409: { description: 'Nombre duplicado' },
  },
});
registry.registerPath({
  method:   'put',
  path:     '/plan-estudios/{id}',
  tags:     ['Plan de Estudios'],
  security: [{ bearerAuth: [] }],
  request:  {
    params: z.object({ id: z.string() }),
    body:   { content: { 'application/json': { schema: UpdatePlanEstudiosSchema } } },
  },
  responses: {
    200: { description: 'Plan actualizado', content: { 'application/json': { schema: PlanEstudiosResponseSchema } } },
    404: { description: 'Plan no encontrado' },
  },
});
registry.registerPath({
  method:   'delete',
  path:     '/plan-estudios/{id}',
  tags:     ['Plan de Estudios'],
  security: [{ bearerAuth: [] }],
  request:  { params: z.object({ id: z.string() }) },
  responses: {
    204: { description: 'Plan eliminado' },
    404: { description: 'Plan no encontrado' },
    409: { description: 'Plan actual o con ciclos asociados' },
  },
});
registry.registerPath({
  method:   'put',
  path:     '/plan-estudios/{id}/activar',
  tags:     ['Plan de Estudios'],
  security: [{ bearerAuth: [] }],
  request:  { params: z.object({ id: z.string() }) },
  responses: {
    200: { description: 'Plan activado', content: { 'application/json': { schema: PlanEstudiosResponseSchema } } },
    404: { description: 'Plan no encontrado' },
    409: { description: 'Ya es el plan actual' },
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
registry.registerPath({
  method:   'post',
  path:     '/grados',
  tags:     ['Grados'],
  security: [{ bearerAuth: [] }],
  request:  { body: { content: { 'application/json': { schema: CreateGradoSchema } } } },
  responses: {
    201: { description: 'Grado creado', content: { 'application/json': { schema: GradoResponseSchema } } },
    409: { description: 'Numero duplicado en el plan o plan actual' },
  },
});
registry.registerPath({
  method:   'put',
  path:     '/grados/{id}',
  tags:     ['Grados'],
  security: [{ bearerAuth: [] }],
  request:  {
    params: z.object({ id: z.string() }),
    body:   { content: { 'application/json': { schema: UpdateGradoSchema } } },
  },
  responses: {
    200: { description: 'Grado actualizado', content: { 'application/json': { schema: GradoResponseSchema } } },
    404: { description: 'Grado no encontrado' },
  },
});
registry.registerPath({
  method:   'delete',
  path:     '/grados/{id}',
  tags:     ['Grados'],
  security: [{ bearerAuth: [] }],
  request:  { params: z.object({ id: z.string() }) },
  responses: {
    204: { description: 'Grado eliminado' },
    404: { description: 'Grado no encontrado' },
    409: { description: 'Plan actual' },
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
registry.registerPath({
  method:   'post',
  path:     '/materias',
  tags:     ['Materias'],
  security: [{ bearerAuth: [] }],
  request:  { body: { content: { 'application/json': { schema: CreateMateriaSchema } } } },
  responses: {
    201: { description: 'Materia creada', content: { 'application/json': { schema: MateriaResponseSchema } } },
    409: { description: 'Nombre duplicado en el plan o plan actual' },
  },
});
registry.registerPath({
  method:   'put',
  path:     '/materias/{id}',
  tags:     ['Materias'],
  security: [{ bearerAuth: [] }],
  request:  {
    params: z.object({ id: z.string() }),
    body:   { content: { 'application/json': { schema: UpdateMateriaSchema } } },
  },
  responses: {
    200: { description: 'Materia actualizada', content: { 'application/json': { schema: MateriaResponseSchema } } },
    404: { description: 'Materia no encontrada' },
  },
});
registry.registerPath({
  method:   'delete',
  path:     '/materias/{id}',
  tags:     ['Materias'],
  security: [{ bearerAuth: [] }],
  request:  { params: z.object({ id: z.string() }) },
  responses: {
    204: { description: 'Materia eliminada' },
    404: { description: 'Materia no encontrada' },
    409: { description: 'Plan actual' },
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
registry.registerPath({
  method:   'post',
  path:     '/nombramientos',
  tags:     ['Nombramientos'],
  security: [{ bearerAuth: [] }],
  request:  { body: { content: { 'application/json': { schema: CreateNombramientoSchema } } } },
  responses: {
    201: { description: 'Nombramiento creado', content: { 'application/json': { schema: NombramientoResponseSchema } } },
    409: { description: 'Nombre duplicado' },
  },
});
registry.registerPath({
  method:   'put',
  path:     '/nombramientos/{id}',
  tags:     ['Nombramientos'],
  security: [{ bearerAuth: [] }],
  request:  {
    params: z.object({ id: z.string() }),
    body:   { content: { 'application/json': { schema: UpdateNombramientoSchema } } },
  },
  responses: {
    200: { description: 'Nombramiento actualizado', content: { 'application/json': { schema: NombramientoResponseSchema } } },
    404: { description: 'Nombramiento no encontrado' },
  },
});
registry.registerPath({
  method:   'delete',
  path:     '/nombramientos/{id}',
  tags:     ['Nombramientos'],
  security: [{ bearerAuth: [] }],
  request:  { params: z.object({ id: z.string() }) },
  responses: {
    204: { description: 'Nombramiento eliminado' },
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
registry.registerPath({
  method:   'post',
  path:     '/roles-empleado',
  tags:     ['Roles Empleado'],
  security: [{ bearerAuth: [] }],
  request:  { body: { content: { 'application/json': { schema: CreateRolEmpleadoSchema } } } },
  responses: {
    201: { description: 'Rol creado', content: { 'application/json': { schema: RolEmpleadoResponseSchema } } },
    409: { description: 'Nombre duplicado' },
  },
});
registry.registerPath({
  method:   'put',
  path:     '/roles-empleado/{id}',
  tags:     ['Roles Empleado'],
  security: [{ bearerAuth: [] }],
  request:  {
    params: z.object({ id: z.string() }),
    body:   { content: { 'application/json': { schema: UpdateRolEmpleadoSchema } } },
  },
  responses: {
    200: { description: 'Rol actualizado', content: { 'application/json': { schema: RolEmpleadoResponseSchema } } },
    404: { description: 'Rol no encontrado' },
  },
});
registry.registerPath({
  method:   'delete',
  path:     '/roles-empleado/{id}',
  tags:     ['Roles Empleado'],
  security: [{ bearerAuth: [] }],
  request:  { params: z.object({ id: z.string() }) },
  responses: {
    204: { description: 'Rol eliminado' },
    404: { description: 'Rol no encontrado' },
  },
});

// Usuarios
registry.registerPath({
  method:   'get',
  path:     '/usuarios',
  tags:     ['Usuarios'],
  security: [{ bearerAuth: [] }],
  responses: { 200: { description: 'Lista de usuarios', content: { 'application/json': { schema: UsuarioResponseSchema } } } },
});
registry.registerPath({
  method:   'get',
  path:     '/usuarios/{id}',
  tags:     ['Usuarios'],
  security: [{ bearerAuth: [] }],
  request:  { params: z.object({ id: z.string().uuid() }) },
  responses: {
    200: { description: 'Usuario encontrado', content: { 'application/json': { schema: UsuarioResponseSchema } } },
    404: { description: 'Usuario no encontrado' },
  },
});
registry.registerPath({
  method:   'post',
  path:     '/usuarios',
  tags:     ['Usuarios'],
  security: [{ bearerAuth: [] }],
  request:  { body: { content: { 'application/json': { schema: CreateUsuarioSchema } } } },
  responses: {
    201: { description: 'Usuario creado', content: { 'application/json': { schema: UsuarioResponseSchema } } },
    409: { description: 'Correo duplicado' },
  },
});
registry.registerPath({
  method:   'put',
  path:     '/usuarios/{id}',
  tags:     ['Usuarios'],
  security: [{ bearerAuth: [] }],
  request:  {
    params: z.object({ id: z.string().uuid() }),
    body:   { content: { 'application/json': { schema: UpdateUsuarioSchema } } },
  },
  responses: {
    200: { description: 'Usuario actualizado', content: { 'application/json': { schema: UsuarioResponseSchema } } },
    404: { description: 'Usuario no encontrado' },
  },
});
registry.registerPath({
  method:   'delete',
  path:     '/usuarios/{id}',
  tags:     ['Usuarios'],
  security: [{ bearerAuth: [] }],
  request:  { params: z.object({ id: z.string().uuid() }) },
  responses: {
    204: { description: 'Usuario eliminado' },
    404: { description: 'Usuario no encontrado' },
  },
});

// Roles
registry.registerPath({
  method:   'get',
  path:     '/roles',
  tags:     ['Roles'],
  security: [{ bearerAuth: [] }],
  responses: { 200: { description: 'Lista de roles', content: { 'application/json': { schema: RolResponseSchema } } } },
});
registry.registerPath({
  method:   'get',
  path:     '/roles/{id}',
  tags:     ['Roles'],
  security: [{ bearerAuth: [] }],
  request:  { params: z.object({ id: z.string().uuid() }) },
  responses: {
    200: { description: 'Rol encontrado', content: { 'application/json': { schema: RolResponseSchema } } },
    404: { description: 'Rol no encontrado' },
  },
});
registry.registerPath({
  method:   'post',
  path:     '/roles',
  tags:     ['Roles'],
  security: [{ bearerAuth: [] }],
  request:  { body: { content: { 'application/json': { schema: CreateRolSchema } } } },
  responses: {
    201: { description: 'Rol creado', content: { 'application/json': { schema: RolResponseSchema } } },
    409: { description: 'Nombre duplicado' },
  },
});
registry.registerPath({
  method:   'put',
  path:     '/roles/{id}',
  tags:     ['Roles'],
  security: [{ bearerAuth: [] }],
  request:  {
    params: z.object({ id: z.string().uuid() }),
    body:   { content: { 'application/json': { schema: UpdateRolSchema } } },
  },
  responses: {
    200: { description: 'Rol actualizado', content: { 'application/json': { schema: RolResponseSchema } } },
    404: { description: 'Rol no encontrado' },
  },
});
registry.registerPath({
  method:   'delete',
  path:     '/roles/{id}',
  tags:     ['Roles'],
  security: [{ bearerAuth: [] }],
  request:  { params: z.object({ id: z.string().uuid() }) },
  responses: {
    204: { description: 'Rol eliminado' },
    404: { description: 'Rol no encontrado' },
  },
});
registry.registerPath({
  method:   'put',
  path:     '/roles/{id}/permisos',
  tags:     ['Roles'],
  security: [{ bearerAuth: [] }],
  request:  {
    params: z.object({ id: z.string().uuid() }),
    body:   { content: { 'application/json': { schema: AsignarPermisosSchema } } },
  },
  responses: {
    200: { description: 'Permisos asignados', content: { 'application/json': { schema: RolResponseSchema } } },
    404: { description: 'Rol no encontrado' },
  },
});
registry.registerPath({
  method:   'post',
  path:     '/roles/recargar',
  tags:     ['Roles'],
  security: [{ bearerAuth: [] }],
  responses: {
    200: { description: 'Cache de permisos recargado' },
  },
});

// Permisos
registry.registerPath({
  method:   'get',
  path:     '/permisos',
  tags:     ['Permisos'],
  security: [{ bearerAuth: [] }],
  responses: { 200: { description: 'Lista de permisos', content: { 'application/json': { schema: PermisoResponseSchema } } } },
});
registry.registerPath({
  method:   'get',
  path:     '/permisos/{id}',
  tags:     ['Permisos'],
  security: [{ bearerAuth: [] }],
  request:  { params: z.object({ id: z.string().uuid() }) },
  responses: {
    200: { description: 'Permiso encontrado', content: { 'application/json': { schema: PermisoResponseSchema } } },
    404: { description: 'Permiso no encontrado' },
  },
});
if (process.env.PERMISOS_CRUD_ENABLED === "true") {
  registry.registerPath({
    method: "post",
    path: "/permisos",
    tags: ["Permisos"],
    security: [{ bearerAuth: [] }],
    request: {
      body: {
        content: { "application/json": { schema: CreatePermisoSchema } },
      },
    },
    responses: {
      201: {
        description: "Permiso creado",
        content: { "application/json": { schema: PermisoResponseSchema } },
      },
      409: { description: "Nombre duplicado" },
    },
  });
  registry.registerPath({
    method: "put",
    path: "/permisos/{id}",
    tags: ["Permisos"],
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({ id: z.string().uuid() }),
      body: {
        content: { "application/json": { schema: UpdatePermisoSchema } },
      },
    },
    responses: {
      200: {
        description: "Permiso actualizado",
        content: { "application/json": { schema: PermisoResponseSchema } },
      },
      404: { description: "Permiso no encontrado" },
    },
  });
  registry.registerPath({
    method: "delete",
    path: "/permisos/{id}",
    tags: ["Permisos"],
    security: [{ bearerAuth: [] }],
    request: { params: z.object({ id: z.string().uuid() }) },
    responses: {
      204: { description: "Permiso eliminado" },
      404: { description: "Permiso no encontrado" },
    },
  });
}

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
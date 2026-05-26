# APAS — Academic Personnel Administration System

Sistema backend para la generación del **Padrón de Estructura Ocupacional Intermedia** de la SEPyC Sinaloa. Desarrollado como proyecto de tesis universitaria.

---

## Tabla de Contenidos

- [Descripción](#descripción)
- [Stack Tecnológico](#stack-tecnológico)
- [Arquitectura](#arquitectura)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Modelos de Base de Datos](#modelos-de-base-de-datos)
- [Módulos y Endpoints](#módulos-y-endpoints)
- [Autenticación y Autorización](#autenticación-y-autorización)
- [Reglas de Negocio](#reglas-de-negocio)
- [Configuración del Entorno](#configuración-del-entorno)
- [Base de Datos](#base-de-datos)
- [Scripts Disponibles](#scripts-disponibles)
- [Testing](#testing)
- [Generación de PDF](#generación-de-pdf)
- [API Docs (Swagger)](#api-docs-swagger)

---

## Descripción

El sistema genera un documento oficial de 7 hojas (el Padrón) que contiene:

- Portada con datos de la escuela y ciclo escolar
- Estadística de inicio de ciclo (existencia de RRHH, distribución docente, movimiento de alumnos)
- Ficha individual por empleado (datos personales, laborales, horario)
- Distribución de alumnos por turno
- Estructura general del personal
- Concentrado de docentes por asignatura
- Horarios de cada grupo

El PDF se genera en tiempo real con Puppeteer y se entrega como blob; no se almacena en disco.

---

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Runtime | Node.js ≥ 18 |
| Lenguaje | TypeScript 6 |
| Framework | Express 5 |
| ORM | Prisma 6 (⚠️ NO usar v7) |
| Base de datos | MySQL (Docker local / Aiven producción) |
| Validación | Zod v4 + @asteasolutions/zod-to-openapi 8.5 |
| PDF | Puppeteer 24 |
| Auth | JWT (jsonwebtoken) + bcrypt |
| Testing | Vitest 4 + Supertest + vitest-mock-extended |
| Docs | Swagger UI Express |

---

## Arquitectura

Monolito modular MVC con las siguientes decisiones de diseño:

- **Una sola BD MySQL** — aislamiento por `idEsc` via middleware, sin multi-tenancy complejo
- **Sin triggers/vistas/funciones almacenadas** — toda la lógica vive en TypeScript
- **Soft delete absoluto** — nunca se ejecuta `DELETE`, siempre `activo: false`
- **UUIDs como PKs** — generados por Prisma con `@default(uuid())`
- **PDF sin persistencia** — generado en backend y entregado como `Buffer`, no se guarda en disco
- **Swagger desde Zod** — los schemas de validación se reutilizan como especificación OpenAPI
- **Sesión validada en BD** — cada request autenticado verifica que el usuario sigue activo y reconstruye `req.user` desde BD, permitiendo reflejar cambios de rol o escuela sin necesidad de renovar el token

---

## Estructura del Proyecto

```
.
├── prisma/
│   ├── schema.prisma          # Schema completo (20+ modelos)
│   ├── seed.ts                # Seed inicial (plan, grados, materias, roles, admin)
│   ├── seed-test.ts           # Seed de prueba para preview del PDF
│   ├── migrations/            # Migraciones SQL generadas por Prisma
│   └── prisma.config.ts       # Config Prisma v6 (NO MODIFICAR)
├── src/
│   ├── app.ts                 # Express + todas las rutas registradas
│   ├── server.ts              # Entry point
│   ├── lib/
│   │   ├── db.ts              # PrismaClient singleton + helper whereEsc()
│   │   ├── errors.ts          # NotFoundError, ConflictError, ValidationError, UnauthorizedError
│   │   ├── permissions.ts     # Cache de permisos por rol (cargado al arrancar)
│   │   ├── rbac.ts            # Middleware requirePermission()
│   │   └── openapi.ts         # Registry OpenAPI con todos los paths
│   ├── middleware/
│   │   ├── auth.middleware.ts      # Verificación JWT + validación activo en BD
│   │   ├── escuela.middleware.ts   # Verifica que req.user tenga idEsc
│   │   └── error.middleware.ts     # Handler global de errores
│   ├── modules/
│   │   ├── auth/
│   │   ├── ciclo/
│   │   ├── cobertura/
│   │   ├── empleado/
│   │   ├── escuela/
│   │   ├── estadistica/
│   │   ├── grado/
│   │   ├── grupo/
│   │   ├── horario/
│   │   ├── materia/
│   │   ├── nombramiento/
│   │   ├── padron/
│   │   │   └── templates/     # hoja1.ts – hoja7.ts, estilos.ts, encabezado.ts, tipos.ts
│   │   ├── permiso/
│   │   ├── plan-estudios/
│   │   ├── plaza/
│   │   ├── rol/
│   │   ├── rol-empleado/
│   │   ├── turno/
│   │   └── usuario/
│   └── __tests__/
│       ├── mocks/
│       │   ├── prisma.mock.ts       # Mock global de PrismaClient
│       │   └── permissions.mock.ts  # Mock del cache de permisos por rol
│       ├── unit/services/           # Tests unitarios de servicios
│       └── integration/             # Tests de integración (rutas HTTP)
├── vitest.config.ts
└── tsconfig.json
```

Cada módulo sigue la estructura: `nombre.controller.ts` / `nombre.routes.ts` / `nombre.schema.ts` / `nombre.service.ts`.

---

## Modelos de Base de Datos

```
roles_usuario         — Roles de acceso al sistema (admin, supervisor, director)
permisos_usuario      — Permisos individuales (recurso:accion)
rol_permiso_usuario   — Asignación de permisos a roles (N:M)
usuarios              — Tabla unificada de usuarios del sistema
escuelas              — Escuelas secundarias
ciclos                — Ciclos escolares (uno activo a la vez)
turnos                — Turnos de la escuela (matutino, vespertino, etc.)
plan_estudios         — Plan SEP (actualmente Plan 2017)
grados                — 1°, 2°, 3° vinculados al plan
materias              — Asignaturas del plan
materia_grado         — Tabla intermedia horas/semana por grado
grupos                — Grupos (Ej: 1°A, 2°B)
personas              — Datos personales base
persona_direc         — Dirección de la persona (1:1)
persona_contact       — Contacto de la persona (1:1)
empleados             — Empleados de la escuela
coberturas            — Suplencias temporales
roles_empleado        — Catálogo de roles laborales (Director, Docente, etc.)
empleado_rol          — Asignación de roles a empleados
preparacion_prof      — Preparación académica del empleado
nombramientos         — Catálogo de nombramientos oficiales
plazas                — Plazas laborales del empleado
plaza_grupo           — Grupos atendidos por plaza (N:M)
trabajo_externo       — Trabajo en otras instituciones
horario_slots         — Slots del horario semanal
estadistica_alumnos   — Estadística de alumnos por ciclo y grupo
padrones              — Historial de generaciones del padrón
```

---

## Módulos y Endpoints

### Autenticación

```
POST   /api/auth/login
```

### Panel Supervisor / Admin

```
GET    /api/escuelas
GET    /api/escuelas/:id
POST   /api/escuelas
PUT    /api/escuelas/:id
DELETE /api/escuelas/:id

GET    /api/usuarios
GET    /api/usuarios/:id
POST   /api/usuarios
PUT    /api/usuarios/:id
DELETE /api/usuarios/:id

GET    /api/roles
GET    /api/roles/:id
POST   /api/roles
PUT    /api/roles/:id
PUT    /api/roles/:id/permisos
DELETE /api/roles/:id
POST   /api/roles/recargar

GET    /api/permisos
GET    /api/permisos/:id
```

### Panel Director (y Supervisor con idEsc)

```
GET    /api/ciclos
GET    /api/ciclos/:id
POST   /api/ciclos
PUT    /api/ciclos/:id
DELETE /api/ciclos/:id
PUT    /api/ciclos/:id/activar

GET    /api/turnos
GET    /api/turnos/:id
POST   /api/turnos
PUT    /api/turnos/:id
DELETE /api/turnos/:id

GET    /api/grupos
GET    /api/grupos/:id
POST   /api/grupos
PUT    /api/grupos/:id
DELETE /api/grupos/:id

GET    /api/empleados
GET    /api/empleados/:id
POST   /api/empleados
PUT    /api/empleados/:id
DELETE /api/empleados/:id

GET    /api/coberturas
GET    /api/coberturas/:id
POST   /api/coberturas
PUT    /api/coberturas/:id/cerrar

GET    /api/plazas
GET    /api/plazas/:id
POST   /api/plazas
PUT    /api/plazas/:id
DELETE /api/plazas/:id

GET    /api/horarios/empleado/:idEmpleado
GET    /api/horarios/grupo/:idGrupo
POST   /api/horarios
DELETE /api/horarios/:id

GET    /api/estadisticas
GET    /api/estadisticas/:id
PUT    /api/estadisticas/:id

POST   /api/padron/generar
GET    /api/padron/historial
```

### Catálogos (autenticado, cualquier rol)

```
GET    /api/plan-estudios
GET    /api/plan-estudios/:id
GET    /api/grados
GET    /api/grados/:id
GET    /api/materias
GET    /api/materias/:id
GET    /api/nombramientos
GET    /api/nombramientos/:id
GET    /api/roles-empleado
GET    /api/roles-empleado/:id
```

### Catálogos — escritura (admin y supervisor)

```
POST   /api/plan-estudios
PUT    /api/plan-estudios/:id
DELETE /api/plan-estudios/:id
PUT    /api/plan-estudios/:id/activar

POST   /api/grados
PUT    /api/grados/:id
DELETE /api/grados/:id

POST   /api/materias
PUT    /api/materias/:id
DELETE /api/materias/:id

POST   /api/nombramientos
PUT    /api/nombramientos/:id
DELETE /api/nombramientos/:id

POST   /api/roles-empleado
PUT    /api/roles-empleado/:id
DELETE /api/roles-empleado/:id
```

---

## Autenticación y Autorización

El sistema usa un modelo RBAC con tres roles principales:

| Rol | Acceso |
|---|---|
| `admin` | Acceso total al sistema |
| `supervisor` | Gestión de escuelas y su personal. Sin acceso a roles/permisos/usuarios |
| `director` | Operaciones de su propia escuela. Catálogos en solo lectura |

```
Authorization: Bearer <jwt>
```

El payload del JWT:
```json
// Admin / Supervisor
{ "id": "uuid", "idRol": "uuid-rol" }

// Director
{ "id": "uuid", "idRol": "uuid-rol", "idEsc": "uuid-escuela" }
```

### Capas de seguridad

1. **Firma JWT** — `authMiddleware` verifica la firma del token.
2. **Usuario activo en BD** — en el mismo middleware, se consulta la BD para confirmar que el usuario sigue activo. Si fue desactivado, el token queda inválido de inmediato. `req.user` se reconstruye desde BD, por lo que cambios de rol o escuela se reflejan sin renovar el token.
3. **Permisos RBAC** — `requirePermission('recurso:accion')` verifica contra el cache en memoria cargado al arrancar.
4. **Escuela** — `escuelaMiddleware` verifica que `req.user.idEsc` exista para rutas que operan sobre una escuela específica.

### Padrón y roles sin escuela en token

Admin y supervisor no tienen `idEsc` en el token. Para endpoints que requieren contexto de escuela (`/padron/generar`, `/padron/historial`) deben proveerlo explícitamente:

```
POST /api/padron/generar   → body:        { idCiclo, idEsc }
GET  /api/padron/historial → query param: ?idEsc=uuid
```

El director no necesita enviarlo — se toma automáticamente del token.

---

## Reglas de Negocio

### Numeración de Control de Empleados
- El director siempre tiene `numControl = "1"`
- Los empleados regulares se numeran desde `"2"` en adelante
- Las coberturas usan el formato `"X.N"` donde X es el numControl del titular y N el ordinal de cobertura activa (ej. `"1.1"`, `"1.2"`)

### Ciclos
- Solo puede haber **un ciclo activo** a la vez por escuela
- Al activar un ciclo, se desactivan todos los demás con `updateMany`
- No se puede eliminar (soft delete) el ciclo activo

### Coberturas
- No existen `DELETE` — solo se pueden **cerrar** (seteando `fFin`)
- Un suplente no puede tener más de una cobertura activa simultánea
- El titular y el suplente no pueden ser el mismo empleado

### Estadística de Alumnos
- No se crea manualmente — se genera automáticamente al crear un grupo (si hay ciclo activo)
- `existencia = inscripcion + altas - bajas` — nunca se almacena, se calcula en cada respuesta
- `desercion = (bajas / inscripcion) * 100` — ídem

### Plazas
- Al actualizar `idGrupos`, se hace `deleteMany` + `createMany` (reemplaza completo)
- El `codigoPlaza` es único por escuela

---

## Configuración del Entorno

Crear archivo `.env` en la raíz a partir del `.env.example` incluido en el repositorio. Las variables requeridas son:

- `DATABASE_URL` — cadena de conexión MySQL
- `JWT_SECRET` — secreto para firmar los tokens
- `JWT_EXPIRES_IN` — duración del token (ej. `8h`)
- `ADMIN_NOMBRE`, `ADMIN_CORREO`, `ADMIN_CONTRA` — credenciales del usuario supervisor inicial
- `NODE_ENV`, `PORT`
- `PERMISOS_CRUD_ENABLED` — (`true`/`false`) habilita endpoints de escritura en `/api/permisos`

---

## Base de Datos

### Docker local (desarrollo)

```bash
docker run --name sepyc-mysql \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=sepyc_padron \
  -p 3306:3306 \
  -d mysql:latest
```

### Aplicar migraciones y seed

```bash
# Crear/aplicar migraciones
npm run migrate init

# Seed inicial (plan 2017, grados, materias, roles, admin)
npm run seed

# Seed de prueba para preview del PDF
npm run seed:test
```

El `seed:test` crea:
- Escuela: **"Secundaria General No. 25 Lazaro Cardenas"** (clave `SIN0025X`)
- Director: `director@sec25.edu.mx` / `director123`
- Ciclo 2024-2025 activo
- 2 turnos (Matutino y Vespertino)
- 12 grupos (2 por grado por turno)
- 15 empleados con plazas, horarios y estadísticas

> ⚠️ El `seed:test` requiere que `npm run seed` ya haya corrido (necesita el Plan 2017).

---

## Scripts Disponibles

```bash
npm run dev          # Servidor en modo desarrollo con nodemon + tsx
npm run build        # Compilar TypeScript a dist/
npm run start        # Correr build compilado
npm run migrate      # Alias de prisma migrate dev (requiere nombre: npm run migrate -- --name init)
npm run seed         # Datos iniciales
npm run seed:test    # Datos de prueba para PDF
npm run db:studio    # Abrir Prisma Studio
npm run db:validate  # Validar schema
npm run test         # Correr todos los tests
npm run test:watch   # Tests en modo watch
npm run test:coverage # Tests con reporte de cobertura
```

---

## Testing

### Configuración

```typescript
// vitest.config.ts — puntos clave
{
  globals: true,
  environment: 'node',
  setupFiles: ['./src/__tests__/mocks/prisma.mock.ts'],
}
```

El mock de Prisma se inyecta globalmente via `vi.mock('../../lib/db', ...)` en `prisma.mock.ts`.
El mock de permisos se inyecta via `permissions.mock.ts`, que replica los permisos reales del seed.

### Estado actual: 408/408 tests pasando

**Tests unitarios** — `src/__tests__/unit/services/`

| Archivo | Tests |
|---|---|
| auth.service.test.ts | 5 |
| catalogo.service.test.ts | 41 |
| ciclo.service.test.ts | 9 |
| cobertura.service.test.ts | 8 |
| estadistica.service.test.ts | 7 |
| empleado.service.test.ts | 9 |
| turno.service.test.ts | 9 |
| grupo.service.test.ts | 8 |
| plaza.service.test.ts | 11 |
| horario.service.test.ts | 10 |
| escuela.service.test.ts | 9 |
| permiso.service.test.ts | 11 |
| readonly.service.test.ts | 15 |
| rol.service.test.ts | 13 |
| usuario.service.test.ts | 15 |

**Tests de integración** — `src/__tests__/integration/`

| Archivo | Tests |
|---|---|
| auth.routes.test.ts | 6 |
| auth.middleware.test.ts | 6 |
| escuela.routes.test.ts | 13 |
| ciclo.routes.test.ts | 14 |
| turno.routes.test.ts | 12 |
| grupo.routes.test.ts | 11 |
| empleado.routes.test.ts | 11 |
| cobertura.routes.test.ts | 10 |
| plaza.routes.test.ts | 11 |
| horario.routes.test.ts | 10 |
| estadistica.routes.test.ts | 7 |
| readonly.routes.test.ts | 21 |
| catalogo.routes.test.ts | 45 |
| padron.routes.test.ts | 14 |
| permiso.routes.test.ts | 5 |
| rol.routes.test.ts | 18 |
| usuario.routes.test.ts | 14 |

### Patrones importantes

```typescript
// Resetear el mock en cada test
beforeEach(() => { mockReset(mockPrisma); });

// Las funciones tokenX() en setup.ts configuran automáticamente el mock
// de usuario.findFirst para el authMiddleware (mockResolvedValueOnce).
// Los mocks de lógica de negocio van después y no interfieren.
const token = tokenDirector();
mockPrisma.turno.findMany.mockResolvedValue([...]);

// Para testear estados inconsistentes entre token y BD,
// usar jwt_sign_only() y configurar el mock manualmente:
const token = jwt_sign_only(UUID_ROL_ADMIN, 'uuid-admin');
mockPrisma.usuario.findFirst.mockResolvedValueOnce(null); // usuario desactivado
```

---

## Generación de PDF

El padrón se genera con Puppeteer renderizando HTML/CSS a PDF formato Tabloid landscape.

### Flujo

1. `POST /api/padron/generar` con `{ idCiclo, idEsc? }`
2. `PadronService.obtenerDatos()` — carga escuela, ciclo, empleados, grupos y roles en paralelo
3. Se construye el HTML concatenando las 7 hojas (más una hoja 3 por cada empleado)
4. Puppeteer renderiza y genera el PDF
5. Se registra en la tabla `padrones` (historial)
6. Se devuelve el buffer con `Content-Type: application/pdf`

### Plantillas (`src/modules/padron/templates/`)

| Archivo | Contenido |
|---|---|
| `estilos.ts` | CSS compartido (tipografía, tablas, firmas) |
| `encabezado.ts` | Header reutilizable con datos de escuela y ciclo |
| `pie.ts` | Pie de firmas reutilizable |
| `tipos.ts` | Types Prisma con includes para el padrón |
| `hoja1.ts` | Portada |
| `hoja2.ts` | Estadística de inicio de ciclo (Tablas A, B, C) |
| `hoja3.ts` | Ficha individual por empleado (se genera N veces) |
| `hoja4.ts` | Distribución de alumnos por turno |
| `hoja5.ts` | Estructura general del personal |
| `hoja6.ts` | Concentrado de docentes por asignatura |
| `hoja7.ts` | Horarios de cada grupo |

> ⚠️ **Pendiente**: Comparar plantillas HTML contra el documento oficial físico para ajustes visuales.

---

## API Docs (Swagger)

Con el servidor corriendo, disponible en:

```
http://localhost:3000/api/docs
```

Los schemas se generan automáticamente desde las definiciones Zod de cada módulo usando `@asteasolutions/zod-to-openapi`.

---

## Notas de Desarrollo

- **Prisma v6** — NO actualizar a v7, hay cambios breaking. El archivo `prisma.config.ts` es sensible, no modificar.
- **Zod v4** — `err.issues` en lugar de `err.errors` en el error middleware. Los UUIDs se validan estrictamente.
- **Express 5** — manejo de errores async sin try/catch explícito en algunos casos, pero se mantiene el patrón explícito para claridad.
- **TypeScript 6** — `req.params.id` requiere cast explícito: `req.params.id as string`.
- **JWT sign** — usar `SignOptions` tipado para evitar errores con `expiresIn`.
- **`$transaction`** — usado en creación de empleados y plazas para atomicidad.
- **Cache de permisos** — cargado al arrancar el servidor via `cargarPermisos()`. Se recarga automáticamente al crear, editar o eliminar roles y permisos. También disponible manualmente via `POST /api/roles/recargar`.
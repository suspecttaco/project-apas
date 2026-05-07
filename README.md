# APAC — Academic Personnel Administration and Control

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
│   │   └── openapi.ts         # Registry OpenAPI con todos los paths
│   ├── middleware/
│   │   ├── auth.middleware.ts      # Verificación JWT
│   │   ├── escuela.middleware.ts   # escuelaMiddleware + supervisorMiddleware
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
│   │   ├── plan-estudios/
│   │   ├── plaza/
│   │   ├── rol-empleado/
│   │   └── turno/
│   └── __tests__/
│       ├── mocks/
│       │   └── prisma.mock.ts # Mock global de PrismaClient
│       ├── unit/services/     # 101 tests unitarios de servicios
│       └── integration/       # 132 tests de integración (rutas HTTP)
├── vitest.config.ts
└── tsconfig.json
```

Cada módulo sigue la estructura: `nombre.controller.ts` / `nombre.routes.ts` / `nombre.schema.ts` / `nombre.service.ts`.

---

## Modelos de Base de Datos

```
usuarios_supervisor   — Supervisores SEPyC
usuarios_director     — Directores por escuela
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
roles_empleado        — Catálogo de roles (Director, Docente, etc.)
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

### Panel Supervisor

```
POST   /api/auth/supervisor/login
GET    /api/supervisor/escuelas
GET    /api/supervisor/escuelas/:id
POST   /api/supervisor/escuelas
PUT    /api/supervisor/escuelas/:id
DELETE /api/supervisor/escuelas/:id
```

### Panel Director

```
POST   /api/auth/director/login

GET    /api/director/ciclos
GET    /api/director/ciclos/:id
POST   /api/director/ciclos
PUT    /api/director/ciclos/:id
DELETE /api/director/ciclos/:id
PUT    /api/director/ciclos/:id/activar

GET    /api/director/turnos
GET    /api/director/turnos/:id
POST   /api/director/turnos
PUT    /api/director/turnos/:id
DELETE /api/director/turnos/:id

GET    /api/director/grupos
GET    /api/director/grupos/:id
POST   /api/director/grupos
PUT    /api/director/grupos/:id
DELETE /api/director/grupos/:id

GET    /api/director/empleados
GET    /api/director/empleados/:id
POST   /api/director/empleados
PUT    /api/director/empleados/:id
DELETE /api/director/empleados/:id

GET    /api/director/coberturas
GET    /api/director/coberturas/:id
POST   /api/director/coberturas
PUT    /api/director/coberturas/:id/cerrar

GET    /api/director/plazas
GET    /api/director/plazas/:id
POST   /api/director/plazas
PUT    /api/director/plazas/:id
DELETE /api/director/plazas/:id

GET    /api/director/horarios/empleado/:idEmpleado
GET    /api/director/horarios/grupo/:idGrupo
POST   /api/director/horarios
DELETE /api/director/horarios/:id

GET    /api/director/estadisticas
GET    /api/director/estadisticas/:id
PUT    /api/director/estadisticas/:id

POST   /api/director/padron/generar
GET    /api/director/padron/historial
```

### Datos de Solo Lectura (autenticado, cualquier rol)

```
GET /api/plan-estudios
GET /api/plan-estudios/:id
GET /api/grados
GET /api/grados/:id
GET /api/materias
GET /api/materias/:id
GET /api/nombramientos
GET /api/nombramientos/:id
GET /api/roles-empleado
GET /api/roles-empleado/:id
```

---

## Autenticación y Autorización

El sistema tiene dos tipos de usuario:

**Supervisor** (`rol: 'admin'` o `'supervisor'`) — acceso al panel de escuelas vía `supervisorMiddleware`. El token no contiene `idEsc`.

**Director** (`rol: 'director'`) — acceso al panel de su escuela vía `escuelaMiddleware`. El token contiene `idEsc` que se usa para filtrar todos los recursos.

```
Authorization: Bearer <jwt>
```

El payload del JWT:
```json
// Supervisor
{ "id": "uuid", "rol": "admin" }

// Director
{ "id": "uuid", "rol": "director", "idEsc": "uuid-escuela" }
```

---

## Reglas de Negocio

### Numeración de Control de Empleados
- El director siempre tiene `numControl = "1"`
- Los empleados regulares se numeran desde `"2"` en adelante (count activos + 2)
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
- Escuela: **"Secundaria General de Prueba"** (clave `TEST001`)
- Director: `director@test.mx` / `director123`
- Ciclo 2024-2025 activo
- Turno Matutino
- Grupos A para cada grado (1°, 2°, 3°)
- Empleado director con plaza y estadísticas básicas

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

### Estado actual: 233/233 tests pasando

**Tests unitarios (101)** — `src/__tests__/unit/services/`

| Archivo | Tests |
|---|---|
| auth.service.test.ts | 5 |
| ciclo.service.test.ts | 9 |
| cobertura.service.test.ts | 8 |
| estadistica.service.test.ts | 7 |
| empleado.service.test.ts | 9 |
| turno.service.test.ts | 9 |
| grupo.service.test.ts | 8 |
| plaza.service.test.ts | 11 |
| horario.service.test.ts | 10 |
| escuela.service.test.ts | 10 |
| readonly.service.test.ts | 15 |

**Tests de integración (132)** — `src/__tests__/integration/`

| Archivo | Tests |
|---|---|
| auth.routes.test.ts | 6 |
| escuela.routes.test.ts | 12 |
| ciclo.routes.test.ts | 14 |
| turno.routes.test.ts | 12 |
| grupo.routes.test.ts | 11 |
| empleado.routes.test.ts | 11 |
| cobertura.routes.test.ts | 10 |
| plaza.routes.test.ts | 11 |
| horario.routes.test.ts | 10 |
| estadistica.routes.test.ts | 7 |
| readonly.routes.test.ts | 21 |
| padron.routes.test.ts | 7 |

**Cobertura global: ~73%**
- Módulos de negocio principales: 90%+
- `padron.service.ts`: ~26% (Puppeteer requiere navegador real, no es testeable con mocks)
- `padron/templates/`: ~3% (misma razón)

### Patrones importantes

```typescript
// Siempre resetear el mock en cada test
import { mockReset } from 'vitest-mock-extended';
beforeEach(() => { mockReset(mockPrisma); });

// Usar UUIDs v4 reales en tests de integración (Zod v4 es estricto)
const UUID_ESC = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
```

---

## Generación de PDF

El padrón se genera con Puppeteer renderizando HTML/CSS a PDF formato Letter.

### Flujo

1. `POST /api/director/padron/generar` con `{ idCiclo: "uuid" }`
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
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { generateOpenApiSpec } from './lib/openapi';
import { errorMiddleware } from './middleware/error.middleware';

import authRoutes         from './modules/auth/auth.routes';
import escuelaRoutes      from './modules/escuela/escuela.routes';
import planEstudiosRoutes from './modules/plan-estudios/plan-estudios.routes';
import gradoRoutes        from './modules/grado/grado.routes';
import materiaRoutes      from './modules/materia/materia.routes';
import nombramientoRoutes from './modules/nombramiento/nombramiento.routes';
import rolEmpleadoRoutes  from './modules/rol-empleado/rol-empleado.routes';
import cicloRoutes        from './modules/ciclo/ciclo.routes';
import turnoRoutes        from './modules/turno/turno.routes';
import grupoRoutes        from './modules/grupo/grupo.routes';
import empleadoRoutes     from './modules/empleado/empleado.routes';
import coberturaRoutes    from './modules/cobertura/cobertura.routes';
import plazaRoutes        from './modules/plaza/plaza.routes';
import horarioRoutes      from './modules/horario/horario.routes';
import estadisticaRoutes  from './modules/estadistica/estadistica.routes';
import padronRoutes       from './modules/padron/padron.routes';
import usuarioRoutes      from './modules/usuario/usuario.routes';
import permisoRoutes      from './modules/permiso/permiso.routes';
import rolRoutes          from './modules/rol/rol.routes';
import analyticsRoutes   from './modules/analytics/analytics.routes';

const app = express();
const origenes = process.env.CORS_ORIGINS?.split(',').map(o => o.trim()) ?? [];

app.use(helmet());
app.use(cors({
  origin: origenes,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Archivos subidos — imágenes de logo de escuelas
app.use('/uploads', (_req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(process.cwd(), 'uploads')));

const spec = generateOpenApiSpec();
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(spec));

// Auth — un solo endpoint para todos los usuarios
app.use('/api/auth', authRoutes);

// Gestion de escuelas — admin y supervisor
app.use('/api/escuelas', escuelaRoutes);

// Catalogos de solo lectura
app.use('/api/plan-estudios', planEstudiosRoutes);
app.use('/api/grados',        gradoRoutes);
app.use('/api/materias',      materiaRoutes);
app.use('/api/nombramientos', nombramientoRoutes);
app.use('/api/roles-empleado', rolEmpleadoRoutes);

// Recursos de escuela — director y supervisor
app.use('/api/ciclos',       cicloRoutes);
app.use('/api/turnos',       turnoRoutes);
app.use('/api/grupos',       grupoRoutes);
app.use('/api/empleados',    empleadoRoutes);
app.use('/api/coberturas',   coberturaRoutes);
app.use('/api/plazas',       plazaRoutes);
app.use('/api/horarios',     horarioRoutes);
app.use('/api/estadisticas', estadisticaRoutes);
app.use('/api/padron',       padronRoutes);

// Permisos
app.use('/api/analytics', analyticsRoutes);
app.use('/api/permisos', permisoRoutes);

// Roles
app.use('/api/roles', rolRoutes);

// Usuarios
app.use('/api/usuarios', usuarioRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorMiddleware);

export default app;
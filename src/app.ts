import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
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

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

const spec = generateOpenApiSpec();
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(spec));

app.use('/api/auth',               authRoutes);
app.use('/api/supervisor/escuelas', escuelaRoutes);
app.use('/api/plan-estudios',       planEstudiosRoutes);
app.use('/api/grados',              gradoRoutes);
app.use('/api/materias',            materiaRoutes);
app.use('/api/nombramientos',       nombramientoRoutes);
app.use('/api/roles-empleado',      rolEmpleadoRoutes);
app.use('/api/director/ciclos',     cicloRoutes);
app.use('/api/director/turnos',     turnoRoutes);
app.use('/api/director/grupos',     grupoRoutes);
app.use('/api/director/empleados',  empleadoRoutes);
app.use('/api/director/coberturas', coberturaRoutes);
app.use('/api/director/plazas',    plazaRoutes);
app.use('/api/director/horarios',      horarioRoutes);
app.use('/api/director/estadisticas',  estadisticaRoutes);
app.use('/api/director/padron',        padronRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorMiddleware);

export default app;
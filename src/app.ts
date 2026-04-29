import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { generateOpenApiSpec } from './lib/openapi';
import { errorMiddleware } from './middleware/error.middleware';

import authRouter from './modules/auth/auth.routes';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

const spec = generateOpenApiSpec();
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(spec));

app.use('/api/auth', authRouter);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorMiddleware);

export default app;
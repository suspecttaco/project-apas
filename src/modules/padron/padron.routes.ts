import { Router } from 'express';
import { PadronController } from './padron.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { escuelaMiddleware } from '../../middleware/escuela.middleware';

const router = Router();

router.use(authMiddleware, escuelaMiddleware);

router.post('/generar',   PadronController.generar);
router.get('/historial',  PadronController.historial);

export default router;

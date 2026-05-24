import { Router } from 'express';
import { PadronController } from './padron.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { escuelaMiddleware } from '../../middleware/escuela.middleware';
import { requirePermission } from '../../lib/rbac';

const router = Router();

router.post('/generar',  authMiddleware, escuelaMiddleware, requirePermission('padron:generate'), PadronController.generar);
router.get('/historial', authMiddleware, escuelaMiddleware, requirePermission('padron:read'),     PadronController.historial);

export default router;
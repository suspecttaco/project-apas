import { Router } from 'express';
import { PadronController } from './padron.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { resolveEscuela } from '../../middleware/resolve-escuela.middleware';
import { requirePermission } from '../../lib/rbac';

const router = Router();

router.post('/generar',          authMiddleware, resolveEscuela, requirePermission('padron:generate'), PadronController.generar);
router.post('/reporte-maestros', authMiddleware, resolveEscuela, requirePermission('padron:generate'), PadronController.reporteMaestros);
router.get('/historial',         authMiddleware, resolveEscuela, requirePermission('padron:read'),     PadronController.historial);

export default router;

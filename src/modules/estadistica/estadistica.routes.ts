import { Router } from 'express';
import { EstadisticaController } from './estadistica.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { escuelaMiddleware } from '../../middleware/escuela.middleware';
import { requirePermission } from '../../lib/rbac';

const router = Router();

router.get('/',    authMiddleware, escuelaMiddleware, requirePermission('estadisticas:read'),  EstadisticaController.getAll);
router.get('/:id', authMiddleware, escuelaMiddleware, requirePermission('estadisticas:read'),  EstadisticaController.getById);
router.put('/:id', authMiddleware, escuelaMiddleware, requirePermission('estadisticas:write'), EstadisticaController.update);

export default router;
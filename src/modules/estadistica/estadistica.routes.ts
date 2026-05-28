import { Router } from 'express';
import { EstadisticaController } from './estadistica.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { resolveEscuela } from '../../middleware/resolve-escuela.middleware';
import { requirePermission } from '../../lib/rbac';

const router = Router();

router.get('/',    authMiddleware, resolveEscuela, requirePermission('estadisticas:read'),  EstadisticaController.getAll);
router.get('/:id', authMiddleware, resolveEscuela, requirePermission('estadisticas:read'),  EstadisticaController.getById);
router.put('/:id', authMiddleware, resolveEscuela, requirePermission('estadisticas:write'), EstadisticaController.update);

export default router;
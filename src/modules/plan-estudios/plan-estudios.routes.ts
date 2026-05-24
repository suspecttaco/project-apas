import { Router } from 'express';
import { PlanEstudiosController } from './plan-estudios.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requirePermission } from '../../lib/rbac';

const router = Router();

router.get('/',            authMiddleware, requirePermission('catalogos:read'),  PlanEstudiosController.getAll);
router.get('/:id',         authMiddleware, requirePermission('catalogos:read'),  PlanEstudiosController.getById);
router.post('/',           authMiddleware, requirePermission('catalogos:write'), PlanEstudiosController.create);
router.put('/:id',         authMiddleware, requirePermission('catalogos:write'), PlanEstudiosController.update);
router.delete('/:id',      authMiddleware, requirePermission('catalogos:write'), PlanEstudiosController.remove);
router.put('/:id/activar', authMiddleware, requirePermission('catalogos:write'), PlanEstudiosController.activar);

export default router;
import { Router } from 'express';
import { PlanEstudiosController } from './plan-estudios.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requirePermission } from '../../lib/rbac';

const router = Router();

router.get('/',    authMiddleware, requirePermission('catalogos:read'), PlanEstudiosController.getAll);
router.get('/:id', authMiddleware, requirePermission('catalogos:read'), PlanEstudiosController.getById);

export default router;
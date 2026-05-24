import { Router } from 'express';
import { GradoController } from './grado.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requirePermission } from '../../lib/rbac';

const router = Router();

router.get('/',    authMiddleware, requirePermission('catalogos:read'), GradoController.getAll);
router.get('/:id', authMiddleware, requirePermission('catalogos:read'), GradoController.getById);

export default router;
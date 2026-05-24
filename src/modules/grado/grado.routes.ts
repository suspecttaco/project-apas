import { Router } from 'express';
import { GradoController } from './grado.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requirePermission } from '../../lib/rbac';

const router = Router();

router.get('/',       authMiddleware, requirePermission('catalogos:read'),  GradoController.getAll);
router.get('/:id',    authMiddleware, requirePermission('catalogos:read'),  GradoController.getById);
router.post('/',      authMiddleware, requirePermission('catalogos:write'), GradoController.create);
router.put('/:id',    authMiddleware, requirePermission('catalogos:write'), GradoController.update);
router.delete('/:id', authMiddleware, requirePermission('catalogos:write'), GradoController.remove);

export default router;
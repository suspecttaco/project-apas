import { Router } from 'express';
import { NombramientoController } from './nombramiento.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requirePermission } from '../../lib/rbac';

const router = Router();

router.get('/',       authMiddleware, requirePermission('catalogos:read'),  NombramientoController.getAll);
router.get('/:id',    authMiddleware, requirePermission('catalogos:read'),  NombramientoController.getById);
router.post('/',      authMiddleware, requirePermission('catalogos:write'), NombramientoController.create);
router.put('/:id',    authMiddleware, requirePermission('catalogos:write'), NombramientoController.update);
router.delete('/:id', authMiddleware, requirePermission('catalogos:write'), NombramientoController.remove);

export default router;
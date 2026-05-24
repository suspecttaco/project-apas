import { Router } from 'express';
import { RolEmpleadoController } from './rol-empleado.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requirePermission } from '../../lib/rbac';

const router = Router();

router.get('/',       authMiddleware, requirePermission('catalogos:read'),  RolEmpleadoController.getAll);
router.get('/:id',    authMiddleware, requirePermission('catalogos:read'),  RolEmpleadoController.getById);
router.post('/',      authMiddleware, requirePermission('catalogos:write'), RolEmpleadoController.create);
router.put('/:id',    authMiddleware, requirePermission('catalogos:write'), RolEmpleadoController.update);
router.delete('/:id', authMiddleware, requirePermission('catalogos:write'), RolEmpleadoController.remove);

export default router;
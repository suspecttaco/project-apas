import { Router } from 'express';
import { PermisoController } from './permiso.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requirePermission } from '../../lib/rbac';

const router = Router();

router.get('/',       authMiddleware, requirePermission('permisos:read'),  PermisoController.getAll);
router.get('/:id',    authMiddleware, requirePermission('permisos:read'),  PermisoController.getById);
router.post('/',      authMiddleware, requirePermission('permisos:write'), PermisoController.create);
router.put('/:id',    authMiddleware, requirePermission('permisos:write'), PermisoController.update);
router.delete('/:id', authMiddleware, requirePermission('permisos:write'), PermisoController.remove);

export default router;
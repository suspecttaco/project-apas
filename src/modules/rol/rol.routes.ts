import { Router } from 'express';
import { RolController } from './rol.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requirePermission } from '../../lib/rbac';

const router = Router();

// Recarga manual del cache -- debe ir antes de /:id para no confundirse con un id
router.post('/recargar',       authMiddleware, requirePermission('roles:write'), RolController.recargarCache);

router.get('/',                authMiddleware, requirePermission('roles:read'),  RolController.getAll);
router.get('/:id',             authMiddleware, requirePermission('roles:read'),  RolController.getById);
router.post('/',               authMiddleware, requirePermission('roles:write'), RolController.create);
router.put('/:id',             authMiddleware, requirePermission('roles:write'), RolController.update);
router.delete('/:id',          authMiddleware, requirePermission('roles:write'), RolController.remove);
router.put('/:id/permisos',    authMiddleware, requirePermission('roles:write'), RolController.asignarPermisos);

export default router;
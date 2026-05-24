import { Router } from 'express';
import { PermisoController } from './permiso.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requirePermission } from '../../lib/rbac';

const router = Router();

// Lectura siempre disponible -- necesario para asignar permisos a roles
router.get('/',    authMiddleware, requirePermission('permisos:read'),  PermisoController.getAll);
router.get('/:id', authMiddleware, requirePermission('permisos:read'),  PermisoController.getById);

// Escritura bloqueada por feature flag -- activar con PERMISOS_CRUD_ENABLED=true en .env
if (process.env.PERMISOS_CRUD_ENABLED === 'true') {
  router.post('/',      authMiddleware, requirePermission('permisos:write'), PermisoController.create);
  router.put('/:id',    authMiddleware, requirePermission('permisos:write'), PermisoController.update);
  router.delete('/:id', authMiddleware, requirePermission('permisos:write'), PermisoController.remove);
}

export default router;
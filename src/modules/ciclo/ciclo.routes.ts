import { Router } from 'express';
import { CicloController } from './ciclo.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { resolveEscuela } from '../../middleware/resolve-escuela.middleware';
import { requirePermission } from '../../lib/rbac';

const router = Router();

router.get('/',            authMiddleware, resolveEscuela, requirePermission('ciclos:read'),  CicloController.getAll);
router.get('/:id',         authMiddleware, resolveEscuela, requirePermission('ciclos:read'),  CicloController.getById);
router.post('/',           authMiddleware, resolveEscuela, requirePermission('ciclos:write'), CicloController.create);
router.put('/:id',         authMiddleware, resolveEscuela, requirePermission('ciclos:write'), CicloController.update);
router.delete('/:id',      authMiddleware, resolveEscuela, requirePermission('ciclos:write'), CicloController.remove);
router.put('/:id/activar', authMiddleware, resolveEscuela, requirePermission('ciclos:write'), CicloController.activar);

export default router;
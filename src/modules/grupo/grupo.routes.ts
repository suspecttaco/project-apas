import { Router } from 'express';
import { GrupoController } from './grupo.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { resolveEscuela } from '../../middleware/resolve-escuela.middleware';
import { requirePermission } from '../../lib/rbac';

const router = Router();

router.get('/',       authMiddleware, resolveEscuela, requirePermission('grupos:read'),  GrupoController.getAll);
router.get('/:id',    authMiddleware, resolveEscuela, requirePermission('grupos:read'),  GrupoController.getById);
router.post('/',      authMiddleware, resolveEscuela, requirePermission('grupos:write'), GrupoController.create);
router.put('/:id',    authMiddleware, resolveEscuela, requirePermission('grupos:write'), GrupoController.update);
router.delete('/:id', authMiddleware, resolveEscuela, requirePermission('grupos:write'), GrupoController.remove);

export default router;
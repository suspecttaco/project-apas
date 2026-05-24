import { Router } from 'express';
import { GrupoController } from './grupo.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { escuelaMiddleware } from '../../middleware/escuela.middleware';
import { requirePermission } from '../../lib/rbac';

const router = Router();

router.get('/',       authMiddleware, escuelaMiddleware, requirePermission('grupos:read'),  GrupoController.getAll);
router.get('/:id',    authMiddleware, escuelaMiddleware, requirePermission('grupos:read'),  GrupoController.getById);
router.post('/',      authMiddleware, escuelaMiddleware, requirePermission('grupos:write'), GrupoController.create);
router.put('/:id',    authMiddleware, escuelaMiddleware, requirePermission('grupos:write'), GrupoController.update);
router.delete('/:id', authMiddleware, escuelaMiddleware, requirePermission('grupos:write'), GrupoController.remove);

export default router;
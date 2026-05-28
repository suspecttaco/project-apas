import { Router } from 'express';
import { PlazaController } from './plaza.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { resolveEscuela } from '../../middleware/resolve-escuela.middleware';
import { requirePermission } from '../../lib/rbac';

const router = Router();

router.get('/',       authMiddleware, resolveEscuela, requirePermission('plazas:read'),  PlazaController.getAll);
router.get('/:id',    authMiddleware, resolveEscuela, requirePermission('plazas:read'),  PlazaController.getById);
router.post('/',      authMiddleware, resolveEscuela, requirePermission('plazas:write'), PlazaController.create);
router.put('/:id',    authMiddleware, resolveEscuela, requirePermission('plazas:write'), PlazaController.update);
router.delete('/:id', authMiddleware, resolveEscuela, requirePermission('plazas:write'), PlazaController.remove);

export default router;
import { Router } from 'express';
import { PlazaController } from './plaza.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { escuelaMiddleware } from '../../middleware/escuela.middleware';
import { requirePermission } from '../../lib/rbac';

const router = Router();

router.get('/',       authMiddleware, escuelaMiddleware, requirePermission('plazas:read'),  PlazaController.getAll);
router.get('/:id',    authMiddleware, escuelaMiddleware, requirePermission('plazas:read'),  PlazaController.getById);
router.post('/',      authMiddleware, escuelaMiddleware, requirePermission('plazas:write'), PlazaController.create);
router.put('/:id',    authMiddleware, escuelaMiddleware, requirePermission('plazas:write'), PlazaController.update);
router.delete('/:id', authMiddleware, escuelaMiddleware, requirePermission('plazas:write'), PlazaController.remove);

export default router;
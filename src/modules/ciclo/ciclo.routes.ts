import { Router } from 'express';
import { CicloController } from './ciclo.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { escuelaMiddleware } from '../../middleware/escuela.middleware';
import { requirePermission } from '../../lib/rbac';

const router = Router();

router.get('/',            authMiddleware, escuelaMiddleware, requirePermission('ciclos:read'),  CicloController.getAll);
router.get('/:id',         authMiddleware, escuelaMiddleware, requirePermission('ciclos:read'),  CicloController.getById);
router.post('/',           authMiddleware, escuelaMiddleware, requirePermission('ciclos:write'), CicloController.create);
router.put('/:id',         authMiddleware, escuelaMiddleware, requirePermission('ciclos:write'), CicloController.update);
router.delete('/:id',      authMiddleware, escuelaMiddleware, requirePermission('ciclos:write'), CicloController.remove);
router.put('/:id/activar', authMiddleware, escuelaMiddleware, requirePermission('ciclos:write'), CicloController.activar);

export default router;
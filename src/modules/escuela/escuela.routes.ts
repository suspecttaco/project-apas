import { Router } from 'express';
import { EscuelaController } from './escuela.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requirePermission } from '../../lib/rbac';

const router = Router();

router.get('/',       authMiddleware, requirePermission('escuelas:read'),  EscuelaController.getAll);
router.get('/:id',    authMiddleware, requirePermission('escuelas:read'),  EscuelaController.getById);
router.post('/',      authMiddleware, requirePermission('escuelas:write'), EscuelaController.create);
router.put('/:id',    authMiddleware, requirePermission('escuelas:write'), EscuelaController.update);
router.delete('/:id', authMiddleware, requirePermission('escuelas:write'), EscuelaController.remove);

export default router;
import { Router } from 'express';
import { MateriaController } from './materia.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requirePermission } from '../../lib/rbac';

const router = Router();

router.get('/',       authMiddleware, requirePermission('catalogos:read'),  MateriaController.getAll);
router.get('/:id',    authMiddleware, requirePermission('catalogos:read'),  MateriaController.getById);
router.post('/',      authMiddleware, requirePermission('catalogos:write'), MateriaController.create);
router.put('/:id',    authMiddleware, requirePermission('catalogos:write'), MateriaController.update);
router.delete('/:id', authMiddleware, requirePermission('catalogos:write'), MateriaController.remove);

export default router;
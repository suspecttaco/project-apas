import { Router } from 'express';
import { MateriaController } from './materia.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requirePermission } from '../../lib/rbac';

const router = Router();

router.get('/',    authMiddleware, requirePermission('catalogos:read'), MateriaController.getAll);
router.get('/:id', authMiddleware, requirePermission('catalogos:read'), MateriaController.getById);

export default router;
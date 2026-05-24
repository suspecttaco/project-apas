import { Router } from 'express';
import { UsuarioController } from './usuario.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requirePermission } from '../../lib/rbac';

const router = Router();

router.get('/',       authMiddleware, requirePermission('usuarios:read'),  UsuarioController.getAll);
router.get('/:id',    authMiddleware, requirePermission('usuarios:read'),  UsuarioController.getById);
router.post('/',      authMiddleware, requirePermission('usuarios:write'), UsuarioController.create);
router.put('/:id',    authMiddleware, requirePermission('usuarios:write'), UsuarioController.update);
router.delete('/:id', authMiddleware, requirePermission('usuarios:write'), UsuarioController.remove);

export default router;
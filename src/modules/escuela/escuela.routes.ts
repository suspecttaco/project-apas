import { Router } from 'express';
import { EscuelaController } from './escuela.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requirePermission } from '../../lib/rbac';
import { uploadLogoMiddleware } from '../../lib/upload';

const router = Router();

router.get('/',       authMiddleware, requirePermission('escuelas:read'),  EscuelaController.getAll);
router.get('/:id',    authMiddleware, requirePermission('escuelas:read'),  EscuelaController.getById);
router.post('/',      authMiddleware, requirePermission('escuelas:write'), EscuelaController.create);
router.put('/:id',    authMiddleware, requirePermission('escuelas:write'), EscuelaController.update);
router.delete('/:id', authMiddleware, requirePermission('escuelas:write'), EscuelaController.remove);

router.post(  '/:id/logo', authMiddleware, requirePermission('escuelas:write'), uploadLogoMiddleware, EscuelaController.uploadLogo);
router.delete('/:id/logo', authMiddleware, requirePermission('escuelas:write'), EscuelaController.deleteLogo);

export default router;
import { Router } from 'express';
import { CoberturaController } from './cobertura.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { escuelaMiddleware } from '../../middleware/escuela.middleware';
import { requirePermission } from '../../lib/rbac';

const router = Router();

router.get('/',           authMiddleware, escuelaMiddleware, requirePermission('coberturas:read'),  CoberturaController.getAll);
router.get('/:id',        authMiddleware, escuelaMiddleware, requirePermission('coberturas:read'),  CoberturaController.getById);
router.post('/',          authMiddleware, escuelaMiddleware, requirePermission('coberturas:write'), CoberturaController.abrir);
router.put('/:id/cerrar', authMiddleware, escuelaMiddleware, requirePermission('coberturas:write'), CoberturaController.cerrar);

export default router;
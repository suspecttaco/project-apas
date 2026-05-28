import { Router } from 'express';
import { CoberturaController } from './cobertura.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { resolveEscuela } from '../../middleware/resolve-escuela.middleware';
import { requirePermission } from '../../lib/rbac';

const router = Router();

router.get('/',           authMiddleware, resolveEscuela, requirePermission('coberturas:read'),  CoberturaController.getAll);
router.get('/:id',        authMiddleware, resolveEscuela, requirePermission('coberturas:read'),  CoberturaController.getById);
router.post('/',          authMiddleware, resolveEscuela, requirePermission('coberturas:write'), CoberturaController.abrir);
router.put('/:id/cerrar', authMiddleware, resolveEscuela, requirePermission('coberturas:write'), CoberturaController.cerrar);

export default router;
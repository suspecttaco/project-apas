import { Router } from 'express';
import { TurnoController } from './turno.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { resolveEscuela } from '../../middleware/resolve-escuela.middleware';
import { requirePermission } from '../../lib/rbac';

const router = Router();

router.get('/',       authMiddleware, resolveEscuela, requirePermission('turnos:read'),  TurnoController.getAll);
router.get('/:id',    authMiddleware, resolveEscuela, requirePermission('turnos:read'),  TurnoController.getById);
router.post('/',      authMiddleware, resolveEscuela, requirePermission('turnos:write'), TurnoController.create);
router.put('/:id',    authMiddleware, resolveEscuela, requirePermission('turnos:write'), TurnoController.update);
router.delete('/:id', authMiddleware, resolveEscuela, requirePermission('turnos:write'), TurnoController.remove);

export default router;
import { Router } from 'express';
import { TurnoController } from './turno.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { escuelaMiddleware } from '../../middleware/escuela.middleware';
import { requirePermission } from '../../lib/rbac';

const router = Router();

router.get('/',       authMiddleware, escuelaMiddleware, requirePermission('turnos:read'),  TurnoController.getAll);
router.get('/:id',    authMiddleware, escuelaMiddleware, requirePermission('turnos:read'),  TurnoController.getById);
router.post('/',      authMiddleware, escuelaMiddleware, requirePermission('turnos:write'), TurnoController.create);
router.put('/:id',    authMiddleware, escuelaMiddleware, requirePermission('turnos:write'), TurnoController.update);
router.delete('/:id', authMiddleware, escuelaMiddleware, requirePermission('turnos:write'), TurnoController.remove);

export default router;
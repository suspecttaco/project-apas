import { Router } from 'express';
import { HorarioController } from './horario.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { resolveEscuela } from '../../middleware/resolve-escuela.middleware';
import { requirePermission } from '../../lib/rbac';

const router = Router();

router.get('/empleado/:idEmpleado', authMiddleware, resolveEscuela, requirePermission('horarios:read'),  HorarioController.getByEmpleado);
router.get('/grupo/:idGrupo',       authMiddleware, resolveEscuela, requirePermission('horarios:read'),  HorarioController.getByGrupo);
router.post('/',                    authMiddleware, resolveEscuela, requirePermission('horarios:write'), HorarioController.create);
router.delete('/:id',               authMiddleware, resolveEscuela, requirePermission('horarios:write'), HorarioController.remove);

export default router;
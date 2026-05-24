import { Router } from 'express';
import { HorarioController } from './horario.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { escuelaMiddleware } from '../../middleware/escuela.middleware';
import { requirePermission } from '../../lib/rbac';

const router = Router();

router.get('/empleado/:idEmpleado', authMiddleware, escuelaMiddleware, requirePermission('horarios:read'),  HorarioController.getByEmpleado);
router.get('/grupo/:idGrupo',       authMiddleware, escuelaMiddleware, requirePermission('horarios:read'),  HorarioController.getByGrupo);
router.post('/',                    authMiddleware, escuelaMiddleware, requirePermission('horarios:write'), HorarioController.create);
router.delete('/:id',               authMiddleware, escuelaMiddleware, requirePermission('horarios:write'), HorarioController.remove);

export default router;
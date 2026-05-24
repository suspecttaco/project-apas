import { Router } from 'express';
import { EmpleadoController } from './empleado.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { escuelaMiddleware } from '../../middleware/escuela.middleware';
import { requirePermission } from '../../lib/rbac';

const router = Router();

router.get('/',       authMiddleware, escuelaMiddleware, requirePermission('empleados:read'),  EmpleadoController.getAll);
router.get('/:id',    authMiddleware, escuelaMiddleware, requirePermission('empleados:read'),  EmpleadoController.getById);
router.post('/',      authMiddleware, escuelaMiddleware, requirePermission('empleados:write'), EmpleadoController.create);
router.put('/:id',    authMiddleware, escuelaMiddleware, requirePermission('empleados:write'), EmpleadoController.update);
router.delete('/:id', authMiddleware, escuelaMiddleware, requirePermission('empleados:write'), EmpleadoController.remove);

export default router;
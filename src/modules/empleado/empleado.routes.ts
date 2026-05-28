import { Router } from 'express';
import { EmpleadoController } from './empleado.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { resolveEscuela } from '../../middleware/resolve-escuela.middleware';
import { requirePermission } from '../../lib/rbac';

const router = Router();

router.get('/',       authMiddleware, resolveEscuela, requirePermission('empleados:read'),  EmpleadoController.getAll);
router.get('/:id',    authMiddleware, resolveEscuela, requirePermission('empleados:read'),  EmpleadoController.getById);
router.post('/',      authMiddleware, resolveEscuela, requirePermission('empleados:write'), EmpleadoController.create);
router.put('/:id',    authMiddleware, resolveEscuela, requirePermission('empleados:write'), EmpleadoController.update);
router.delete('/:id', authMiddleware, resolveEscuela, requirePermission('empleados:write'), EmpleadoController.remove);

export default router;
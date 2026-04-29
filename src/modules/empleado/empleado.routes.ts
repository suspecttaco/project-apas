import { Router } from 'express';
import { EmpleadoController } from './empleado.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { escuelaMiddleware } from '../../middleware/escuela.middleware';

const router = Router();

router.use(authMiddleware, escuelaMiddleware);

router.get('/',       EmpleadoController.getAll);
router.get('/:id',    EmpleadoController.getById);
router.post('/',      EmpleadoController.create);
router.put('/:id',    EmpleadoController.update);
router.delete('/:id', EmpleadoController.remove);

export default router;

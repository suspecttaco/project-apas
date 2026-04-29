import { Router } from 'express';
import { RolEmpleadoController } from './rol-empleado.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/',    RolEmpleadoController.getAll);
router.get('/:id', RolEmpleadoController.getById);

export default router;
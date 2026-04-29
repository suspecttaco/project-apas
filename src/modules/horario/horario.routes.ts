import { Router } from 'express';
import { HorarioController } from './horario.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { escuelaMiddleware } from '../../middleware/escuela.middleware';

const router = Router();

router.use(authMiddleware, escuelaMiddleware);

router.get('/empleado/:idEmpleado', HorarioController.getByEmpleado);
router.get('/grupo/:idGrupo',       HorarioController.getByGrupo);
router.post('/',                    HorarioController.create);
router.delete('/:id',               HorarioController.remove);

export default router;

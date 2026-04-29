import { Router } from 'express';
import { TurnoController } from './turno.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { escuelaMiddleware } from '../../middleware/escuela.middleware';

const router = Router();

router.use(authMiddleware, escuelaMiddleware);

router.get('/',       TurnoController.getAll);
router.get('/:id',    TurnoController.getById);
router.post('/',      TurnoController.create);
router.put('/:id',    TurnoController.update);
router.delete('/:id', TurnoController.remove);

export default router;

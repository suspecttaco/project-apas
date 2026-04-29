import { Router } from 'express';
import { EstadisticaController } from './estadistica.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { escuelaMiddleware } from '../../middleware/escuela.middleware';

const router = Router();

router.use(authMiddleware, escuelaMiddleware);

router.get('/',    EstadisticaController.getAll);
router.get('/:id', EstadisticaController.getById);
router.put('/:id', EstadisticaController.update);

export default router;

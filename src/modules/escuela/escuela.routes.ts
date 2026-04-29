import { Router } from 'express';
import { EscuelaController } from './escuela.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { supervisorMiddleware } from '../../middleware/escuela.middleware';

const router = Router();

router.use(authMiddleware, supervisorMiddleware);

router.get('/',      EscuelaController.getAll);
router.get('/:id',   EscuelaController.getById);
router.post('/',     EscuelaController.create);
router.put('/:id',   EscuelaController.update);
router.delete('/:id', EscuelaController.remove);

export default router;
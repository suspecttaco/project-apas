import { Router } from 'express';
import { MateriaController } from './materia.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/',    MateriaController.getAll);
router.get('/:id', MateriaController.getById);

export default router;
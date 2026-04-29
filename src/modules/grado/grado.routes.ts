import { Router } from 'express';
import { GradoController } from './grado.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/',    GradoController.getAll);
router.get('/:id', GradoController.getById);

export default router;
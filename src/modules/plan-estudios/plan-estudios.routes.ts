import { Router } from 'express';
import { PlanEstudiosController } from './plan-estudios.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/',    PlanEstudiosController.getAll);
router.get('/:id', PlanEstudiosController.getById);

export default router;
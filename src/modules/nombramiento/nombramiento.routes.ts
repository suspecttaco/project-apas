import { Router } from 'express';
import { NombramientoController } from './nombramiento.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/',    NombramientoController.getAll);
router.get('/:id', NombramientoController.getById);

export default router;
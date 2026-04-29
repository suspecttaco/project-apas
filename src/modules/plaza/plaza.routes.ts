import { Router } from 'express';
import { PlazaController } from './plaza.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { escuelaMiddleware } from '../../middleware/escuela.middleware';

const router = Router();

router.use(authMiddleware, escuelaMiddleware);

router.get('/',       PlazaController.getAll);
router.get('/:id',    PlazaController.getById);
router.post('/',      PlazaController.create);
router.put('/:id',    PlazaController.update);
router.delete('/:id', PlazaController.remove);

export default router;

import { Router } from 'express';
import { GrupoController } from './grupo.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { escuelaMiddleware } from '../../middleware/escuela.middleware';

const router = Router();

router.use(authMiddleware, escuelaMiddleware);

router.get('/',       GrupoController.getAll);
router.get('/:id',    GrupoController.getById);
router.post('/',      GrupoController.create);
router.put('/:id',    GrupoController.update);
router.delete('/:id', GrupoController.remove);

export default router;

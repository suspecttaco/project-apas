import { Router } from 'express';
import { CicloController } from './ciclo.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { escuelaMiddleware } from '../../middleware/escuela.middleware';

const router = Router();

router.use(authMiddleware, escuelaMiddleware);

router.get('/',            CicloController.getAll);
router.get('/:id',         CicloController.getById);
router.post('/',           CicloController.create);
router.put('/:id',         CicloController.update);
router.delete('/:id',      CicloController.remove);
router.put('/:id/activar', CicloController.activar);

export default router;

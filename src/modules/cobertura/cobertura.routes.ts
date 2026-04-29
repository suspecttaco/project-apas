import { Router } from 'express';
import { CoberturaController } from './cobertura.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { escuelaMiddleware } from '../../middleware/escuela.middleware';

const router = Router();

router.use(authMiddleware, escuelaMiddleware);

router.get('/',              CoberturaController.getAll);
router.get('/:id',           CoberturaController.getById);
router.post('/',             CoberturaController.abrir);
router.put('/:id/cerrar',    CoberturaController.cerrar);

export default router;

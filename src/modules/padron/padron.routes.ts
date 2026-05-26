import { Router } from 'express';
import { PadronController } from './padron.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { escuelaMiddleware } from '../../middleware/escuela.middleware';
import { requirePermission } from '../../lib/rbac';

const router = Router();

// escuelaMiddleware solo en director — admin y supervisor proveen idEsc en body/query
router.post('/generar',
  authMiddleware,
  requirePermission('padron:generate'),
  PadronController.generar,
);

router.get('/historial',
  authMiddleware,
  requirePermission('padron:read'),
  PadronController.historial,
);

export default router;
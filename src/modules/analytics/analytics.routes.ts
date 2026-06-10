import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requirePermission } from '../../lib/rbac';
import { AnalyticsService, getLogoBase64 } from './analytics.service';

const router = Router();

// GET /api/analytics/zona — datos de zona para supervisor/admin
// idEsc es opcional: sin él devuelve todas las escuelas, con él filtra a una
router.get('/zona',
  authMiddleware,
  requirePermission('estadisticas:read'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const idEsc = (req.query.idEsc as string | undefined) ?? req.user.idEsc ?? undefined;
      const data  = await AnalyticsService.getZona(idEsc);
      res.json(data);
    } catch (err) { next(err); }
  },
);

// GET /api/analytics/logo — devuelve el logo SEPyC como data-URL base64
router.get('/logo',
  authMiddleware,
  (_req: Request, res: Response) => {
    const logo = getLogoBase64();
    res.json({ logo });
  },
);

export default router;

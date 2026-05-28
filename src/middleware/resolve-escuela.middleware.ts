import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../lib/errors';

declare global {
  namespace Express {
    interface Request {
      escuelaId: string;
    }
  }
}

/**
 * Resuelve el idEsc efectivo para la request:
 *   - Director: lo toma del token (req.user.idEsc)
 *   - Admin/Supervisor: lo toma de req.query.idEsc o req.body.idEsc
 *
 * El resultado se guarda en req.escuelaId para que los controladores
 * lo usen en lugar de req.user.idEsc.
 *
 * Usar después de authMiddleware.
 */
export function resolveEscuela(req: Request, res: Response, next: NextFunction) {
  const idEsc =
    req.user.idEsc ??
    (req.query.idEsc as string | undefined) ??
    (req.body?.idEsc as string | undefined);

  if (!idEsc) {
    return next(new ValidationError('Se requiere idEsc (query param o body) para este rol'));
  }

  req.escuelaId = idEsc;
  next();
}
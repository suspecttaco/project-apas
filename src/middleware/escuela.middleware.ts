import { Request, Response, NextFunction } from 'express';

// Verifica que el usuario tenga idEsc en el token
// Usar en rutas que operan sobre una escuela especifica
export function escuelaMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.user.idEsc) {
    return res.status(403).json({ message: 'No tienes una escuela asignada' });
  }
  next();
}
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface JwtPayload {
  id:    string;
  idRol: string;
  // Solo presente si el rol del usuario requiere escuela asignada
  idEsc?: string;
}

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No autorizado - token requerido' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as unknown as JwtPayload;
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ message: 'Token invalido o expirado' });
  }
}
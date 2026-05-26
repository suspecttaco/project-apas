import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../lib/db';

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

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No autorizado - token requerido' });
  }

  let payload: JwtPayload;

  try {
    payload = jwt.verify(token, process.env.JWT_SECRET!) as unknown as JwtPayload;
  } catch {
    return res.status(401).json({ message: 'Token invalido o expirado' });
  }

  const usuario = await db.usuario.findFirst({
    where: { id: payload.id, activo: true },
  });

  if (!usuario) {
    return res.status(401).json({ message: 'Sesion invalida o usuario desactivado' });
  }

  // Reconstruir desde BD para reflejar cambios de rol o escuela en caliente
  req.user = {
    id:    usuario.id,
    idRol: usuario.idRol,
    ...(usuario.idEsc && { idEsc: usuario.idEsc }),
  };

  next();
}
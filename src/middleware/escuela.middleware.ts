import { Request, Response, NextFunction } from "express";

export function escuelaMiddleware(req: Request, res: Response, next: NextFunction) {
    if (req.user.rol !== 'director' || !req.user.idEsc) {
        return res.status(403).json({ message: 'Acceso restringido: solo personal autorizado'});
    }
    next();
}

export function supervisorMiddleware(req: Request, res: Response, next: NextFunction){
  if (req.user.rol !== 'supervisor' && req.user.rol !== 'admin') {
    return res.status(403).json({ message: 'Acceso restringido: solo personal autorizador' });
  }
  next();
}
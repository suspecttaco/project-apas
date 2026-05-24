import { Request, Response, NextFunction } from "express";
import { tienePermiso } from "./permissions";

// Middleware que verifica si tiene el permiso requerido
// Usar despues de auth.middleware para garantizar que req.user existe

export function requirePermission(permiso: string) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!tienePermiso(req.user.idRol, permiso)) {
            return res.status(403).json({ message: 'No tienes permisos para realizar esta accion' });
        }
        next();
    };
}
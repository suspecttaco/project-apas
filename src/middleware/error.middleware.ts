import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { NotFoundError, ConflictError, ValidationError, UnauthorizedError } from "../lib/errors";

export function errorMiddleware(
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction
) {
    if (err instanceof ZodError) {
        return res.status(400).json({
            message: 'Datos invalidos',
            errors: err.issues.map(e => ({
                campo: e.path.join('.'),
                mensaje: e.message,
            })),
        });
    }

    if (err instanceof NotFoundError)    return res.status(404).json({ message: err.message });
    if (err instanceof ConflictError)    return res.status(409).json({ message: err.message });
    if (err instanceof ValidationError)  return res.status(400).json({ message: err.message });
    if (err instanceof UnauthorizedError) return res.status(401).json({ message: err.message });

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') return res.status(409).json({ message: 'Registro duplicado' });
        if (err.code === 'P2025') return res.status(404).json({ message: 'Registro no encontrado' });
    }

    console.error('[ERROR]', err);
    return res.status(500).json({ message: 'Error interno del servidor' });
}
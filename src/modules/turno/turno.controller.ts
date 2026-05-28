import { Request, Response, NextFunction } from 'express';
import { TurnoService } from './turno.service';
import { CreateTurnoSchema, UpdateTurnoSchema } from './turno.schema';

export class TurnoController {

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await TurnoService.getAll(req.escuelaId));
    } catch (error) { next(error); }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await TurnoService.getById(req.params.id as string, req.escuelaId));
    } catch (error) { next(error); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = CreateTurnoSchema.parse(req.body);
      res.status(201).json(await TurnoService.create(dto, req.escuelaId));
    } catch (error) { next(error); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = UpdateTurnoSchema.parse(req.body);
      res.json(await TurnoService.update(req.params.id as string, dto, req.escuelaId));
    } catch (error) { next(error); }
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await TurnoService.softDelete(req.params.id as string, req.escuelaId);
      res.status(204).send();
    } catch (error) { next(error); }
  }
}
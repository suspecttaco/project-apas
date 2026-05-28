import { Request, Response, NextFunction } from 'express';
import { EstadisticaService } from './estadistica.service';
import { UpdateEstadisticaSchema } from './estadistica.schema';

export class EstadisticaController {

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await EstadisticaService.getAll(req.escuelaId));
    } catch (error) { next(error); }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await EstadisticaService.getById(req.params.id as string, req.escuelaId));
    } catch (error) { next(error); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = UpdateEstadisticaSchema.parse(req.body);
      res.json(await EstadisticaService.update(req.params.id as string, dto, req.escuelaId));
    } catch (error) { next(error); }
  }
}
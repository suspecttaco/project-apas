import { Request, Response, NextFunction } from 'express';
import { RolEmpleadoService } from './rol-empleado.service';

export class RolEmpleadoController {

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await RolEmpleadoService.getAll());
    } catch (error) { next(error); }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await RolEmpleadoService.getById(req.params.id as string));
    } catch (error) { next(error); }
  }
}
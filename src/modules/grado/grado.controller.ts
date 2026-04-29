import { Request, Response, NextFunction } from 'express';
import { GradoService } from './grado.service';

export class GradoController {

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await GradoService.getAll());
    } catch (error) { next(error); }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await GradoService.getById(req.params.id as string));
    } catch (error) { next(error); }
  }
}
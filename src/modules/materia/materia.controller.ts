import { Request, Response, NextFunction } from 'express';
import { MateriaService } from './materia.service';

export class MateriaController {

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await MateriaService.getAll());
    } catch (error) { next(error); }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await MateriaService.getById(req.params.id as string));
    } catch (error) { next(error); }
  }
}
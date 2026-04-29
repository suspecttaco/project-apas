import { Request, Response, NextFunction } from 'express';
import { NombramientoService } from './nombramiento.service';

export class NombramientoController {

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await NombramientoService.getAll());
    } catch (error) { next(error); }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await NombramientoService.getById(req.params.id as string));
    } catch (error) { next(error); }
  }
}
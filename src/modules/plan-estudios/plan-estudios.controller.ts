import { Request, Response, NextFunction } from 'express';
import { PlanEstudiosService } from './plan-estudios.service';

export class PlanEstudiosController {

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await PlanEstudiosService.getAll());
    } catch (error) { next(error); }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await PlanEstudiosService.getById(req.params.id as string));
    } catch (error) { next(error); }
  }
}
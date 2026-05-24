import { Request, Response, NextFunction } from 'express';
import { PlanEstudiosService } from './plan-estudios.service';
import { CreatePlanEstudiosSchema, UpdatePlanEstudiosSchema } from './plan-estudios.schema';

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

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = CreatePlanEstudiosSchema.parse(req.body);
      res.status(201).json(await PlanEstudiosService.create(dto));
    } catch (error) { next(error); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = UpdatePlanEstudiosSchema.parse(req.body);
      res.json(await PlanEstudiosService.update(req.params.id as string, dto));
    } catch (error) { next(error); }
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await PlanEstudiosService.softDelete(req.params.id as string);
      res.status(204).send();
    } catch (error) { next(error); }
  }

  static async activar(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await PlanEstudiosService.activar(req.params.id as string));
    } catch (error) { next(error); }
  }
}
import { Request, Response, NextFunction } from 'express';
import { GradoService } from './grado.service';
import { CreateGradoSchema, UpdateGradoSchema } from './grado.schema';

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

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = CreateGradoSchema.parse(req.body);
      res.status(201).json(await GradoService.create(dto));
    } catch (error) { next(error); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = UpdateGradoSchema.parse(req.body);
      res.json(await GradoService.update(req.params.id as string, dto));
    } catch (error) { next(error); }
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await GradoService.softDelete(req.params.id as string);
      res.status(204).send();
    } catch (error) { next(error); }
  }
}
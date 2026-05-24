import { Request, Response, NextFunction } from 'express';
import { MateriaService } from './materia.service';
import { CreateMateriaSchema, UpdateMateriaSchema } from './materia.schema';

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

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = CreateMateriaSchema.parse(req.body);
      res.status(201).json(await MateriaService.create(dto));
    } catch (error) { next(error); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = UpdateMateriaSchema.parse(req.body);
      res.json(await MateriaService.update(req.params.id as string, dto));
    } catch (error) { next(error); }
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await MateriaService.softDelete(req.params.id as string);
      res.status(204).send();
    } catch (error) { next(error); }
  }
}
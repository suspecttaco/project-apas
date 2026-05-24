import { Request, Response, NextFunction } from 'express';
import { PermisoService } from './permiso.service';
import { CreatePermisoSchema, UpdatePermisoSchema } from './permiso.schema';

export class PermisoController {

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await PermisoService.getAll());
    } catch (error) { next(error); }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await PermisoService.getById(req.params.id as string));
    } catch (error) { next(error); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = CreatePermisoSchema.parse(req.body);
      res.status(201).json(await PermisoService.create(dto));
    } catch (error) { next(error); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = UpdatePermisoSchema.parse(req.body);
      res.json(await PermisoService.update(req.params.id as string, dto));
    } catch (error) { next(error); }
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await PermisoService.softDelete(req.params.id as string);
      res.status(204).send();
    } catch (error) { next(error); }
  }
}
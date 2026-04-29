import { Request, Response, NextFunction } from 'express';
import { CicloService } from './ciclo.service';
import { CreateCicloSchema, UpdateCicloSchema } from './ciclo.schema';

export class CicloController {

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await CicloService.getAll(req.user.idEsc as string));
    } catch (error) { next(error); }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await CicloService.getById(req.params.id as string, req.user.idEsc as string));
    } catch (error) { next(error); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = CreateCicloSchema.parse(req.body);
      res.status(201).json(await CicloService.create(dto, req.user.idEsc as string));
    } catch (error) { next(error); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = UpdateCicloSchema.parse(req.body);
      res.json(await CicloService.update(req.params.id as string, dto, req.user.idEsc as string));
    } catch (error) { next(error); }
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await CicloService.softDelete(req.params.id as string, req.user.idEsc as string);
      res.status(204).send();
    } catch (error) { next(error); }
  }

  static async activar(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await CicloService.activar(req.params.id as string, req.user.idEsc as string));
    } catch (error) { next(error); }
  }
}

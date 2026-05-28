import { Request, Response, NextFunction } from 'express';
import { GrupoService } from './grupo.service';
import { CreateGrupoSchema, UpdateGrupoSchema } from './grupo.schema';

export class GrupoController {

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await GrupoService.getAll(req.escuelaId));
    } catch (error) { next(error); }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await GrupoService.getById(req.params.id as string, req.escuelaId));
    } catch (error) { next(error); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = CreateGrupoSchema.parse(req.body);
      res.status(201).json(await GrupoService.create(dto, req.escuelaId));
    } catch (error) { next(error); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = UpdateGrupoSchema.parse(req.body);
      res.json(await GrupoService.update(req.params.id as string, dto, req.escuelaId));
    } catch (error) { next(error); }
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await GrupoService.softDelete(req.params.id as string, req.escuelaId);
      res.status(204).send();
    } catch (error) { next(error); }
  }
}
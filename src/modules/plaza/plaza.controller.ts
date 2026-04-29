import { Request, Response, NextFunction } from 'express';
import { PlazaService } from './plaza.service';
import { CreatePlazaSchema, UpdatePlazaSchema } from './plaza.schema';

export class PlazaController {

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await PlazaService.getAll(req.user.idEsc as string));
    } catch (error) { next(error); }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await PlazaService.getById(req.params.id as string, req.user.idEsc as string));
    } catch (error) { next(error); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = CreatePlazaSchema.parse(req.body);
      res.status(201).json(await PlazaService.create(dto, req.user.idEsc as string));
    } catch (error) { next(error); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = UpdatePlazaSchema.parse(req.body);
      res.json(await PlazaService.update(req.params.id as string, dto, req.user.idEsc as string));
    } catch (error) { next(error); }
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await PlazaService.softDelete(req.params.id as string, req.user.idEsc as string);
      res.status(204).send();
    } catch (error) { next(error); }
  }
}

import { Request, Response, NextFunction } from 'express';
import { NombramientoService } from './nombramiento.service';
import { CreateNombramientoSchema, UpdateNombramientoSchema } from './nombramiento.schema';

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

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = CreateNombramientoSchema.parse(req.body);
      res.status(201).json(await NombramientoService.create(dto));
    } catch (error) { next(error); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = UpdateNombramientoSchema.parse(req.body);
      res.json(await NombramientoService.update(req.params.id as string, dto));
    } catch (error) { next(error); }
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await NombramientoService.softDelete(req.params.id as string);
      res.status(204).send();
    } catch (error) { next(error); }
  }
}
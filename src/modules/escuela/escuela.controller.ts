import { Request, Response, NextFunction } from 'express';
import { EscuelaService } from './escuela.service';
import { CreateEscuelaSchema, UpdateEscuelaSchema } from './escuela.schema';

export class EscuelaController {

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const escuelas = await EscuelaService.getAll();
      res.json(escuelas);
    } catch (error) { next(error); }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const escuela = await EscuelaService.getById(req.params.id as string);
      res.json(escuela);
    } catch (error) { next(error); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const dto     = CreateEscuelaSchema.parse(req.body);
      const escuela = await EscuelaService.create(dto);
      res.status(201).json(escuela);
    } catch (error) { next(error); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const dto     = UpdateEscuelaSchema.parse(req.body);
      const escuela = await EscuelaService.update(req.params.id as string, dto);
      res.json(escuela);
    } catch (error) { next(error); }
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await EscuelaService.softDelete(req.params.id as string);
      res.status(204).send();
    } catch (error) { next(error); }
  }
}
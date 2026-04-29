import { Request, Response, NextFunction } from 'express';
import { CoberturaService } from './cobertura.service';
import { CreateCoberturaSchema } from './cobertura.schema';

export class CoberturaController {

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await CoberturaService.getAll(req.user.idEsc as string));
    } catch (error) { next(error); }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await CoberturaService.getById(req.params.id as string, req.user.idEsc as string));
    } catch (error) { next(error); }
  }

  static async abrir(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = CreateCoberturaSchema.parse(req.body);
      res.status(201).json(await CoberturaService.abrir(dto, req.user.idEsc as string));
    } catch (error) { next(error); }
  }

  static async cerrar(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await CoberturaService.cerrar(req.params.id as string, req.user.idEsc as string));
    } catch (error) { next(error); }
  }
}

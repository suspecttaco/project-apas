import { Request, Response, NextFunction } from 'express';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioSchema, UpdateUsuarioSchema } from './usuario.schema';

export class UsuarioController {

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await UsuarioService.getAll());
    } catch (error) { next(error); }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await UsuarioService.getById(req.params.id as string));
    } catch (error) { next(error); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = CreateUsuarioSchema.parse(req.body);
      res.status(201).json(await UsuarioService.create(dto));
    } catch (error) { next(error); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = UpdateUsuarioSchema.parse(req.body);
      res.json(await UsuarioService.update(req.params.id as string, dto));
    } catch (error) { next(error); }
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await UsuarioService.softDelete(req.params.id as string);
      res.status(204).send();
    } catch (error) { next(error); }
  }
}
import { Request, Response, NextFunction } from 'express';
import { RolService } from './rol.service';
import { CreateRolSchema, UpdateRolSchema, AsignarPermisosSchema } from './rol.schema';

export class RolController {

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await RolService.getAll());
    } catch (error) { next(error); }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await RolService.getById(req.params.id as string));
    } catch (error) { next(error); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = CreateRolSchema.parse(req.body);
      res.status(201).json(await RolService.create(dto));
    } catch (error) { next(error); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = UpdateRolSchema.parse(req.body);
      res.json(await RolService.update(req.params.id as string, dto));
    } catch (error) { next(error); }
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await RolService.softDelete(req.params.id as string);
      res.status(204).send();
    } catch (error) { next(error); }
  }

  static async asignarPermisos(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = AsignarPermisosSchema.parse(req.body);
      res.json(await RolService.asignarPermisos(req.params.id as string, dto));
    } catch (error) { next(error); }
  }

  static async recargarCache(req: Request, res: Response, next: NextFunction) {
    try {
      await RolService.recargarCache();
      res.json({ message: 'Cache de permisos recargado correctamente' });
    } catch (error) { next(error); }
  }
}
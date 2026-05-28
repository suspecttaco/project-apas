import { Request, Response, NextFunction } from 'express';
import { EmpleadoService } from './empleado.service';
import { CreateEmpleadoSchema, UpdateEmpleadoSchema } from './empleado.schema';

export class EmpleadoController {

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await EmpleadoService.getAll(req.escuelaId));
    } catch (error) { next(error); }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await EmpleadoService.getById(req.params.id as string, req.escuelaId));
    } catch (error) { next(error); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = CreateEmpleadoSchema.parse(req.body);
      res.status(201).json(await EmpleadoService.create(dto, req.escuelaId));
    } catch (error) { next(error); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = UpdateEmpleadoSchema.parse(req.body);
      res.json(await EmpleadoService.update(req.params.id as string, dto, req.escuelaId));
    } catch (error) { next(error); }
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await EmpleadoService.softDelete(req.params.id as string, req.escuelaId);
      res.status(204).send();
    } catch (error) { next(error); }
  }
}
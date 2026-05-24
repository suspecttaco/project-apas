import { Request, Response, NextFunction } from 'express';
import { RolEmpleadoService } from './rol-empleado.service';
import { CreateRolEmpleadoSchema, UpdateRolEmpleadoSchema } from './rol-empleado.schema';

export class RolEmpleadoController {

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await RolEmpleadoService.getAll());
    } catch (error) { next(error); }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await RolEmpleadoService.getById(req.params.id as string));
    } catch (error) { next(error); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = CreateRolEmpleadoSchema.parse(req.body);
      res.status(201).json(await RolEmpleadoService.create(dto));
    } catch (error) { next(error); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = UpdateRolEmpleadoSchema.parse(req.body);
      res.json(await RolEmpleadoService.update(req.params.id as string, dto));
    } catch (error) { next(error); }
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await RolEmpleadoService.softDelete(req.params.id as string);
      res.status(204).send();
    } catch (error) { next(error); }
  }
}
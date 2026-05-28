import { Request, Response, NextFunction } from 'express';
import { HorarioService } from './horario.service';
import { CreateHorarioSlotSchema } from './horario.schema';

export class HorarioController {

  static async getByEmpleado(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await HorarioService.getByEmpleado(req.params.idEmpleado as string, req.escuelaId));
    } catch (error) { next(error); }
  }

  static async getByGrupo(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await HorarioService.getByGrupo(req.params.idGrupo as string, req.escuelaId));
    } catch (error) { next(error); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = CreateHorarioSlotSchema.parse(req.body);
      res.status(201).json(await HorarioService.create(dto, req.escuelaId));
    } catch (error) { next(error); }
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await HorarioService.softDelete(req.params.id as string, req.escuelaId);
      res.status(204).send();
    } catch (error) { next(error); }
  }
}
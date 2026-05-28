import { Request, Response, NextFunction } from 'express';
import { PadronService } from './padron.service';
import { GenerarPadronSchema } from './padron.schema';

export class PadronController {

  static async generar(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = GenerarPadronSchema.parse(req.body);
      const pdf = await PadronService.generar(req.escuelaId, dto.idCiclo);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="padron.pdf"');
      res.send(pdf);
    } catch (error) { next(error); }
  }

  static async historial(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await PadronService.historial(req.escuelaId));
    } catch (error) { next(error); }
  }
}
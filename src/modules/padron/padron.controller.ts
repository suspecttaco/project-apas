import { Request, Response, NextFunction } from 'express';
import { PadronService } from './padron.service';
import { GenerarPadronSchema } from './padron.schema';
import { ValidationError } from '../../lib/errors';

export class PadronController {

  static async generar(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = GenerarPadronSchema.parse(req.body);

      // El director toma idEsc del token. Admin y supervisor lo envían en el body.
      const idEsc = req.user.idEsc ?? dto.idEsc;

      if (!idEsc) {
        throw new ValidationError('Se requiere idEsc en el body para este rol');
      }

      const pdf = await PadronService.generar(idEsc, dto.idCiclo);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="padron.pdf"');
      res.send(pdf);
    } catch (error) { next(error); }
  }

  static async historial(req: Request, res: Response, next: NextFunction) {
    try {
      // Mismo patrón: director usa token, admin/supervisor envían query param ?idEsc=
      const idEsc = req.user.idEsc ?? (req.query.idEsc as string | undefined);

      if (!idEsc) {
        throw new ValidationError('Se requiere el parámetro idEsc para este rol');
      }

      res.json(await PadronService.historial(idEsc));
    } catch (error) { next(error); }
  }
}
import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { LoginSupervisorSchema, LoginDirectorSchema } from './auth.schema';

export class AuthController {

  static async loginSupervisor(req: Request, res: Response, next: NextFunction) {
    try {
      const dto   = LoginSupervisorSchema.parse(req.body);
      const token = await AuthService.loginSupervisor(dto);
      res.json({ token });
    } catch (error) { next(error); }
  }

  static async loginDirector(req: Request, res: Response, next: NextFunction) {
    try {
      const dto   = LoginDirectorSchema.parse(req.body);
      const token = await AuthService.loginDirector(dto);
      res.json({ token });
    } catch (error) { next(error); }
  }
}
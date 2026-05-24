import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { LoginSchema } from './auth.schema';

export class AuthController {

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const dto   = LoginSchema.parse(req.body);
      const token = await AuthService.login(dto);
      res.json({ token });
    } catch (error) { next(error); }
  }
}
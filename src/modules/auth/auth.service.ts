import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { db } from '../../lib/db';
import { UnauthorizedError } from '../../lib/errors';
import { LoginSupervisorDTO, LoginDirectorDTO } from './auth.schema';

const jwtOptions: SignOptions = {
  expiresIn: (process.env.JWT_EXPIRES_IN ?? '8h') as SignOptions['expiresIn'],
};

export class AuthService {

  static async loginSupervisor(dto: LoginSupervisorDTO): Promise<string> {
    const usuario = await db.usuarioSupervisor.findFirst({
      where: { correo: dto.correo, activo: true },
    });

    if (!usuario) throw new UnauthorizedError('Credenciales invalidas');

    const valido = await bcrypt.compare(dto.contra, usuario.contra);
    if (!valido) throw new UnauthorizedError('Credenciales invalidas');

    return jwt.sign(
      { id: usuario.id, rol: usuario.rol },
      process.env.JWT_SECRET!,
      jwtOptions
    );
  }

  static async loginDirector(dto: LoginDirectorDTO): Promise<string> {
    const usuario = await db.usuarioDirector.findFirst({
      where: { correo: dto.correo, activo: true },
    });

    if (!usuario) throw new UnauthorizedError('Credenciales invalidas');

    const valido = await bcrypt.compare(dto.contra, usuario.contra);
    if (!valido) throw new UnauthorizedError('Credenciales invalidas');

    return jwt.sign(
      { id: usuario.id, rol: 'director', idEsc: usuario.idEsc },
      process.env.JWT_SECRET!,
      jwtOptions
    );
  }
}
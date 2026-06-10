import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { db } from '../../lib/db';
import { UnauthorizedError } from '../../lib/errors';
import { LoginSchema } from './auth.schema';

const jwtOptions: SignOptions = {
  expiresIn: (process.env.JWT_EXPIRES_IN ?? '8h') as SignOptions['expiresIn'],
};

export class AuthService {

  static async me(id: string) {
    const usuario = await db.usuario.findFirst({
      where:   { id, activo: true },
      include: { rol: true, escuela: true },
    });
    if (!usuario) throw new UnauthorizedError('Sesion invalida');
    return usuario;
  }

  static async login(dto: LoginSchema): Promise<string> {
    const usuario = await db.usuario.findFirst({
      where:   { correo: dto.correo, activo: true },
      include: { rol: true },
    });

    if (!usuario) throw new UnauthorizedError('Credenciales invalidas');

    const valido = await bcrypt.compare(dto.contra, usuario.contra);
    if (!valido) throw new UnauthorizedError('Credenciales invalidas');

    // Si el rol requiere escuela asignada y no la tiene, no puede operar
    if (usuario.rol.requiereEscuela && !usuario.idEsc) {
      throw new UnauthorizedError('No tienes una escuela asignada');
    }

    return jwt.sign(
      {
        id:    usuario.id,
        idRol: usuario.idRol,
        // Solo se incluye si existe
        ...(usuario.idEsc && { idEsc: usuario.idEsc }),
      },
      process.env.JWT_SECRET!,
      jwtOptions
    );
  }
}
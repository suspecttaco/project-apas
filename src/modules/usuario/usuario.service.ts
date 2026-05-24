import bcrypt from 'bcrypt';
import { db } from '../../lib/db';
import { NotFoundError, ConflictError, ValidationError } from '../../lib/errors';
import { CreateUsuarioDTO, UpdateUsuarioDTO } from './usuario.schema';

// Include reutilizable para traer el usuario con su rol y escuela
const includeCompleto = {
  rol:    true,
  escuela: true,
};

export class UsuarioService {

  static async getAll() {
    return db.usuario.findMany({
      where:   { activo: true },
      include: includeCompleto,
      orderBy: { nombre: 'asc' },
    });
  }

  static async getById(id: string) {
    const usuario = await db.usuario.findFirst({
      where:   { id, activo: true },
      include: includeCompleto,
    });
    if (!usuario) throw new NotFoundError('Usuario');
    return usuario;
  }

  static async create(dto: CreateUsuarioDTO) {
    // Verifica que el correo no este en uso
    const correoExiste = await db.usuario.findFirst({ where: { correo: dto.correo } });
    if (correoExiste) throw new ConflictError('El correo ya esta registrado');

    // Verifica que el rol exista
    const rol = await db.rolUsuario.findFirst({ where: { id: dto.idRol, activo: true } });
    if (!rol) throw new NotFoundError('Rol');

    // Si el rol requiere escuela, debe venir idEsc
    if (rol.requiereEscuela && !dto.idEsc) {
      throw new ValidationError('Este rol requiere una escuela asignada');
    }

    // Si viene idEsc, verifica que la escuela exista
    if (dto.idEsc) {
      const escuela = await db.escuela.findFirst({ where: { id: dto.idEsc, activo: true } });
      if (!escuela) throw new NotFoundError('Escuela');
    }

    const hash = await bcrypt.hash(dto.contra, 12);

    return db.usuario.create({
      data: {
        nombre: dto.nombre,
        correo: dto.correo,
        contra: hash,
        idRol:  dto.idRol,
        idEsc:  dto.idEsc ?? null,
      },
      include: includeCompleto,
    });
  }

  static async update(id: string, dto: UpdateUsuarioDTO) {
    const usuario = await UsuarioService.getById(id);

    // Verifica que el nuevo correo no este en uso
    if (dto.correo && dto.correo !== usuario.correo) {
      const correoExiste = await db.usuario.findFirst({
        where: { correo: dto.correo, NOT: { id } },
      });
      if (correoExiste) throw new ConflictError('El correo ya esta registrado');
    }

    // Si cambia el rol, valida que exista y verifica requiereEscuela
    const idRolFinal = dto.idRol ?? usuario.idRol;
    const idEscFinal = dto.idEsc !== undefined ? dto.idEsc : usuario.idEsc;

    if (dto.idRol) {
      const rol = await db.rolUsuario.findFirst({ where: { id: dto.idRol, activo: true } });
      if (!rol) throw new NotFoundError('Rol');

      if (rol.requiereEscuela && !idEscFinal) {
        throw new ValidationError('Este rol requiere una escuela asignada');
      }
    }

    // Si viene idEsc, verifica que la escuela exista
    if (dto.idEsc) {
      const escuela = await db.escuela.findFirst({ where: { id: dto.idEsc, activo: true } });
      if (!escuela) throw new NotFoundError('Escuela');
    }

    const data: Record<string, unknown> = {
      ...(dto.nombre !== undefined && { nombre: dto.nombre }),
      ...(dto.correo !== undefined && { correo: dto.correo }),
      ...(dto.idRol  !== undefined && { idRol:  dto.idRol  }),
      ...(dto.idEsc  !== undefined && { idEsc:  dto.idEsc  }),
    };

    // Hashea la nueva contrasena si viene
    if (dto.contra) {
      data.contra = await bcrypt.hash(dto.contra, 12);
    }

    return db.usuario.update({
      where:   { id },
      data,
      include: includeCompleto,
    });
  }

  static async softDelete(id: string) {
    await UsuarioService.getById(id);
    return db.usuario.update({ where: { id }, data: { activo: false } });
  }
}
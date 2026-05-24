import { db } from '../../lib/db';
import { cargarPermisos } from '../../lib/permissions';
import { NotFoundError, ConflictError } from '../../lib/errors';
import { CreatePermisoDTO, UpdatePermisoDTO } from './permiso.schema';

export class PermisoService {

  static async getAll() {
    return db.permisoUsuario.findMany({
      where:   { activo: true },
      orderBy: { nombre: 'asc' },
    });
  }

  static async getById(id: string) {
    const permiso = await db.permisoUsuario.findFirst({ where: { id, activo: true } });
    if (!permiso) throw new NotFoundError('Permiso');
    return permiso;
  }

  static async create(dto: CreatePermisoDTO) {
    const existe = await db.permisoUsuario.findFirst({ where: { nombre: dto.nombre } });
    if (existe) throw new ConflictError('Ya existe un permiso con ese nombre');

    const permiso = await db.permisoUsuario.create({ data: dto });

    // Recarga el cache para que el nuevo permiso este disponible
    await cargarPermisos();

    return permiso;
  }

  static async update(id: string, dto: UpdatePermisoDTO) {
    await PermisoService.getById(id);

    if (dto.nombre) {
      const existe = await db.permisoUsuario.findFirst({
        where: { nombre: dto.nombre, NOT: { id } },
      });
      if (existe) throw new ConflictError('Ya existe un permiso con ese nombre');
    }

    const permiso = await db.permisoUsuario.update({ where: { id }, data: dto });

    await cargarPermisos();

    return permiso;
  }

  static async softDelete(id: string) {
    await PermisoService.getById(id);
    const permiso = await db.permisoUsuario.update({ where: { id }, data: { activo: false } });

    await cargarPermisos();

    return permiso;
  }
}
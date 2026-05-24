import { db } from '../../lib/db';
import { cargarPermisos } from '../../lib/permissions';
import { NotFoundError, ConflictError } from '../../lib/errors';
import { CreateRolDTO, UpdateRolDTO, AsignarPermisosDTO } from './rol.schema';

// Include reutilizable para traer el rol con sus permisos
const includePermisos = {
  permisos: {
    include: { permiso: true },
  },
};

export class RolService {

  static async getAll() {
    return db.rolUsuario.findMany({
      where:   { activo: true },
      include: includePermisos,
      orderBy: { nombre: 'asc' },
    });
  }

  static async getById(id: string) {
    const rol = await db.rolUsuario.findFirst({
      where:   { id, activo: true },
      include: includePermisos,
    });
    if (!rol) throw new NotFoundError('Rol');
    return rol;
  }

  static async create(dto: CreateRolDTO) {
    const existe = await db.rolUsuario.findFirst({ where: { nombre: dto.nombre } });
    if (existe) throw new ConflictError('Ya existe un rol con ese nombre');

    const rol = await db.rolUsuario.create({
      data:    dto,
      include: includePermisos,
    });

    await cargarPermisos();

    return rol;
  }

  static async update(id: string, dto: UpdateRolDTO) {
    await RolService.getById(id);

    if (dto.nombre) {
      const existe = await db.rolUsuario.findFirst({
        where: { nombre: dto.nombre, NOT: { id } },
      });
      if (existe) throw new ConflictError('Ya existe un rol con ese nombre');
    }

    const rol = await db.rolUsuario.update({
      where:   { id },
      data:    dto,
      include: includePermisos,
    });

    await cargarPermisos();

    return rol;
  }

  static async softDelete(id: string) {
    await RolService.getById(id);

    const rol = await db.rolUsuario.update({
      where:   { id },
      data:    { activo: false },
      include: includePermisos,
    });

    await cargarPermisos();

    return rol;
  }

  // Reemplaza todos los permisos del rol con los nuevos ids
  static async asignarPermisos(id: string, dto: AsignarPermisosDTO) {
    await RolService.getById(id);

    await db.$transaction(async (tx) => {
      // Elimina los permisos actuales
      await tx.rolPermisoUsuario.deleteMany({ where: { idRol: id } });

      // Asigna los nuevos
      if (dto.idPermisos.length > 0) {
        await tx.rolPermisoUsuario.createMany({
          data: dto.idPermisos.map(idPermiso => ({ idRol: id, idPermiso })),
        });
      }
    });

    await cargarPermisos();

    return RolService.getById(id);
  }

  // Recarga manual del cache -- para uso desde el endpoint de admin
  static async recargarCache() {
    await cargarPermisos();
  }
}
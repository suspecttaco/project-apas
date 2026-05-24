import { db } from '../../lib/db';
import { NotFoundError, ConflictError } from '../../lib/errors';
import { CreateRolEmpleadoDTO, UpdateRolEmpleadoDTO } from './rol-empleado.schema';

export class RolEmpleadoService {

  static async getAll() {
    return db.rolEmpleado.findMany({
      where:   { activo: true },
      orderBy: { nombre: 'asc' },
    });
  }

  static async getById(id: string) {
    const rol = await db.rolEmpleado.findFirst({ where: { id, activo: true } });
    if (!rol) throw new NotFoundError('Rol de empleado');
    return rol;
  }

  static async create(dto: CreateRolEmpleadoDTO) {
    const existe = await db.rolEmpleado.findFirst({ where: { nombre: dto.nombre } });
    if (existe) throw new ConflictError('Ya existe un rol con ese nombre');

    return db.rolEmpleado.create({ data: dto });
  }

  static async update(id: string, dto: UpdateRolEmpleadoDTO) {
    await RolEmpleadoService.getById(id);

    if (dto.nombre) {
      const existe = await db.rolEmpleado.findFirst({
        where: { nombre: dto.nombre, NOT: { id } },
      });
      if (existe) throw new ConflictError('Ya existe un rol con ese nombre');
    }

    return db.rolEmpleado.update({ where: { id }, data: dto });
  }

  static async softDelete(id: string) {
    await RolEmpleadoService.getById(id);
    return db.rolEmpleado.update({ where: { id }, data: { activo: false } });
  }
}
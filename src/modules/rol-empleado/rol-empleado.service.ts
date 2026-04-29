import { db } from '../../lib/db';
import { NotFoundError } from '../../lib/errors';

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
}
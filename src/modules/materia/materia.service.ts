import { db } from '../../lib/db';
import { NotFoundError } from '../../lib/errors';

export class MateriaService {

  static async getAll() {
    return db.materia.findMany({
      where:   { activo: true },
      orderBy: { nombre: 'asc' },
    });
  }

  static async getById(id: string) {
    const materia = await db.materia.findFirst({ where: { id, activo: true } });
    if (!materia) throw new NotFoundError('Materia');
    return materia;
  }
}
import { db } from '../../lib/db';
import { NotFoundError } from '../../lib/errors';

export class GradoService {

  static async getAll() {
    return db.grado.findMany({
      where:   { activo: true },
      orderBy: { numero: 'asc' },
    });
  }

  static async getById(id: string) {
    const grado = await db.grado.findFirst({ where: { id, activo: true } });
    if (!grado) throw new NotFoundError('Grado');
    return grado;
  }
}
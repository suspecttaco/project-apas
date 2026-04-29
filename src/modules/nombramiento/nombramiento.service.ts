import { db } from '../../lib/db';
import { NotFoundError } from '../../lib/errors';

export class NombramientoService {

  static async getAll() {
    return db.nombramiento.findMany({
      where:   { activo: true },
      orderBy: { nombre: 'asc' },
    });
  }

  static async getById(id: string) {
    const nombramiento = await db.nombramiento.findFirst({ where: { id, activo: true } });
    if (!nombramiento) throw new NotFoundError('Nombramiento');
    return nombramiento;
  }
}
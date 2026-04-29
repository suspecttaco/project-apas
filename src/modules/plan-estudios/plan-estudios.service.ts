import { db } from '../../lib/db';
import { NotFoundError } from '../../lib/errors';

export class PlanEstudiosService {

  static async getAll() {
    return db.planEstudios.findMany({
      where:   { activo: true },
      orderBy: { fCre: 'asc' },
    });
  }

  static async getById(id: string) {
    const plan = await db.planEstudios.findFirst({
      where:   { id, activo: true },
      include: { grados: { where: { activo: true } }, materias: { where: { activo: true } } },
    });
    if (!plan) throw new NotFoundError('Plan de estudios');
    return plan;
  }
}
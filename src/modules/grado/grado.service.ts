import { db } from '../../lib/db';
import { NotFoundError, ConflictError } from '../../lib/errors';
import { CreateGradoDTO, UpdateGradoDTO } from './grado.schema';

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

  static async create(dto: CreateGradoDTO) {
    // Verificar que el plan exista y no sea actual
    const plan = await db.planEstudios.findFirst({ where: { id: dto.idPlan, activo: true } });
    if (!plan) throw new NotFoundError('Plan de estudios');
    if (plan.actual) throw new ConflictError('No se pueden agregar grados al plan actual');

    const existe = await db.grado.findFirst({
      where: { numero: dto.numero, idPlan: dto.idPlan },
    });
    if (existe) throw new ConflictError('Ya existe un grado con ese numero en este plan');

    return db.grado.create({ data: dto });
  }

  static async update(id: string, dto: UpdateGradoDTO) {
    await GradoService.getById(id);
    // Editar nombre permitido aunque el plan sea actual
    return db.grado.update({ where: { id }, data: dto });
  }

  static async softDelete(id: string) {
    const grado = await GradoService.getById(id);

    // Verificar que el plan no sea actual
    const plan = await db.planEstudios.findFirst({ where: { id: grado.idPlan } });
    if (plan?.actual) throw new ConflictError('No se pueden desactivar grados del plan actual');

    return db.grado.update({ where: { id }, data: { activo: false } });
  }
}
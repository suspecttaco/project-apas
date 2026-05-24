import { db } from '../../lib/db';
import { NotFoundError, ConflictError } from '../../lib/errors';
import { CreatePlanEstudiosDTO, UpdatePlanEstudiosDTO } from './plan-estudios.schema';

const includeCompleto = {
  grados:   { where: { activo: true }, orderBy: { numero: 'asc' as const } },
  materias: { where: { activo: true }, orderBy: { nombre: 'asc' as const } },
};

export class PlanEstudiosService {

  static async getAll() {
    return db.planEstudios.findMany({
      where:   { activo: true },
      include: includeCompleto,
      orderBy: { fCre: 'asc' },
    });
  }

  static async getById(id: string) {
    const plan = await db.planEstudios.findFirst({
      where:   { id, activo: true },
      include: includeCompleto,
    });
    if (!plan) throw new NotFoundError('Plan de estudios');
    return plan;
  }

  static async create(dto: CreatePlanEstudiosDTO) {
    const existe = await db.planEstudios.findFirst({ where: { nombre: dto.nombre } });
    if (existe) throw new ConflictError('Ya existe un plan con ese nombre');

    return db.$transaction(async (tx) => {
      const plan = await tx.planEstudios.create({
        data: { nombre: dto.nombre, desc: dto.desc },
      });

      for (const g of dto.grados) {
        await tx.grado.create({
          data: { nombre: g.nombre, numero: g.numero, idPlan: plan.id },
        });
      }

      for (const m of dto.materias) {
        await tx.materia.create({
          data: { nombre: m.nombre, desc: m.desc, idPlan: plan.id },
        });
      }

      return tx.planEstudios.findFirst({
        where:   { id: plan.id },
        include: includeCompleto,
      });
    });
  }

  static async update(id: string, dto: UpdatePlanEstudiosDTO) {
    const plan = await PlanEstudiosService.getById(id);

    if (dto.nombre && dto.nombre !== plan.nombre) {
      const existe = await db.planEstudios.findFirst({
        where: { nombre: dto.nombre, NOT: { id } },
      });
      if (existe) throw new ConflictError('Ya existe un plan con ese nombre');
    }

    return db.planEstudios.update({
      where:   { id },
      data:    dto,
      include: includeCompleto,
    });
  }

  static async softDelete(id: string) {
    const plan = await PlanEstudiosService.getById(id);

    if (plan.actual) throw new ConflictError('No se puede desactivar el plan actual');

    const tieneCiclos = await db.ciclo.findFirst({ where: { idPlan: id } });
    if (tieneCiclos) throw new ConflictError('No se puede desactivar un plan que tiene ciclos asociados');

    return db.planEstudios.update({ where: { id }, data: { activo: false } });
  }

  static async activar(id: string) {
    const plan = await PlanEstudiosService.getById(id);

    if (plan.actual) throw new ConflictError('Este plan ya es el plan actual');

    await db.$transaction(async (tx) => {
      await tx.planEstudios.updateMany({
        where: { actual: true },
        data:  { actual: false },
      });
      await tx.planEstudios.update({
        where: { id },
        data:  { actual: true },
      });
    });

    return PlanEstudiosService.getById(id);
  }
}
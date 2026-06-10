import { db } from '../../lib/db';
import { NotFoundError, ConflictError } from '../../lib/errors';
import { CreateMateriaDTO, UpdateMateriaDTO } from './materia.schema';

export class MateriaService {

  private static readonly inc = { plan: true };

  static async getAll() {
    return db.materia.findMany({
      where:   { activo: true },
      include: MateriaService.inc,
      orderBy: { nombre: 'asc' },
    });
  }

  static async getById(id: string) {
    const materia = await db.materia.findFirst({ where: { id, activo: true }, include: MateriaService.inc });
    if (!materia) throw new NotFoundError('Materia');
    return materia;
  }

  static async create(dto: CreateMateriaDTO) {
    const plan = await db.planEstudios.findFirst({ where: { id: dto.idPlan, activo: true } });
    if (!plan) throw new NotFoundError('Plan de estudios');
    if (plan.actual) throw new ConflictError('No se pueden agregar materias al plan actual');

    const existe = await db.materia.findFirst({
      where: { nombre: dto.nombre, idPlan: dto.idPlan },
    });
    if (existe) throw new ConflictError('Ya existe una materia con ese nombre en este plan');

    return db.materia.create({ data: dto, include: MateriaService.inc });
  }

  static async update(id: string, dto: UpdateMateriaDTO) {
    const materia = await MateriaService.getById(id);

    if (dto.nombre && dto.nombre !== materia.nombre) {
      const existe = await db.materia.findFirst({
        where: { nombre: dto.nombre, idPlan: materia.idPlan, NOT: { id } },
      });
      if (existe) throw new ConflictError('Ya existe una materia con ese nombre en este plan');
    }

    return db.materia.update({ where: { id }, data: dto, include: MateriaService.inc });
  }

  static async softDelete(id: string) {
    const materia = await MateriaService.getById(id);

    // Verificar que el plan no sea actual
    const plan = await db.planEstudios.findFirst({ where: { id: materia.idPlan } });
    if (plan?.actual) throw new ConflictError('No se pueden desactivar materias del plan actual');

    return db.materia.update({ where: { id }, data: { activo: false } });
  }
}
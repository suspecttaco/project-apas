import { db, whereEsc } from '../../lib/db';
import { NotFoundError, ConflictError } from '../../lib/errors';
import { CreateCicloDTO, UpdateCicloDTO } from './ciclo.schema';

export class CicloService {

  static async getAll(idEsc: string) {
    return db.ciclo.findMany({
      where:   whereEsc(idEsc),
      orderBy: { fInicio: 'desc' },
    });
  }

  static async getById(id: string, idEsc: string) {
    const ciclo = await db.ciclo.findFirst({ where: { id, ...whereEsc(idEsc) } });
    if (!ciclo) throw new NotFoundError('Ciclo');
    return ciclo;
  }

  static async create(dto: CreateCicloDTO, idEsc: string) {
    const existe = await db.ciclo.findFirst({
      where: { nombre: dto.nombre, idEsc },
    });
    if (existe) throw new ConflictError('Ya existe un ciclo con ese nombre en esta escuela');

    return db.ciclo.create({ data: { ...dto, idEsc, activo: false } });
  }

  static async update(id: string, dto: UpdateCicloDTO, idEsc: string) {
    await CicloService.getById(id, idEsc);

    if (dto.nombre) {
      const existe = await db.ciclo.findFirst({
        where: { nombre: dto.nombre, idEsc, NOT: { id } },
      });
      if (existe) throw new ConflictError('Ya existe un ciclo con ese nombre en esta escuela');
    }

    return db.ciclo.update({ where: { id }, data: dto });
  }

  static async softDelete(id: string, idEsc: string) {
    const ciclo = await CicloService.getById(id, idEsc);
    if (ciclo.activo) throw new ConflictError('No se puede eliminar el ciclo activo');
    return db.ciclo.update({ where: { id }, data: { activo: false } });
  }

  static async activar(id: string, idEsc: string) {
    await CicloService.getById(id, idEsc);
    await db.ciclo.updateMany({ where: { idEsc, activo: true }, data: { activo: false } });
    return db.ciclo.update({ where: { id }, data: { activo: true } });
  }
}

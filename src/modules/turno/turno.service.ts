import { db, whereEsc } from '../../lib/db';
import { NotFoundError, ConflictError } from '../../lib/errors';
import { CreateTurnoDTO, UpdateTurnoDTO } from './turno.schema';

export class TurnoService {

  static async getAll(idEsc: string) {
    return db.turno.findMany({
      where:   whereEsc(idEsc),
      orderBy: { hInicio: 'asc' },
    });
  }

  static async getById(id: string, idEsc: string) {
    const turno = await db.turno.findFirst({ where: { id, ...whereEsc(idEsc) } });
    if (!turno) throw new NotFoundError('Turno');
    return turno;
  }

  static async create(dto: CreateTurnoDTO, idEsc: string) {
    const existe = await db.turno.findFirst({
      where: { nombre: dto.nombre, idEsc, activo: true },
    });
    if (existe) throw new ConflictError('Ya existe un turno con ese nombre en esta escuela');

    return db.turno.create({ data: { ...dto, idEsc } });
  }

  static async update(id: string, dto: UpdateTurnoDTO, idEsc: string) {
    await TurnoService.getById(id, idEsc);

    if (dto.nombre) {
      const existe = await db.turno.findFirst({
        where: { nombre: dto.nombre, idEsc, activo: true, NOT: { id } },
      });
      if (existe) throw new ConflictError('Ya existe un turno con ese nombre en esta escuela');
    }

    return db.turno.update({ where: { id }, data: dto });
  }

  static async softDelete(id: string, idEsc: string) {
    await TurnoService.getById(id, idEsc);
    return db.turno.update({ where: { id }, data: { activo: false } });
  }
}

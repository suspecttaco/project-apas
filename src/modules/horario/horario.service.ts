import { db, whereEsc } from '../../lib/db';
import { NotFoundError, ConflictError } from '../../lib/errors';
import { CreateHorarioSlotDTO } from './horario.schema';

export class HorarioService {

  static async getByEmpleado(idEmpleado: string, idEsc: string) {
    const empleado = await db.empleado.findFirst({ where: { id: idEmpleado, ...whereEsc(idEsc) } });
    if (!empleado) throw new NotFoundError('Empleado');

    return db.horarioSlot.findMany({
      where:   { idEmpleado, activo: true },
      include: { grupo: { include: { grado: true } }, materia: true },
      orderBy: [{ diaSemana: 'asc' }, { hInicio: 'asc' }],
    });
  }

  static async getByGrupo(idGrupo: string, idEsc: string) {
    const grupo = await db.grupo.findFirst({ where: { id: idGrupo, ...whereEsc(idEsc) } });
    if (!grupo) throw new NotFoundError('Grupo');

    return db.horarioSlot.findMany({
      where:   { idGrupo, activo: true },
      include: { empleado: { include: { persona: true } }, materia: true },
      orderBy: [{ diaSemana: 'asc' }, { hInicio: 'asc' }],
    });
  }

  static async create(dto: CreateHorarioSlotDTO, idEsc: string) {
    const grupo = await db.grupo.findFirst({ where: { id: dto.idGrupo, ...whereEsc(idEsc) } });
    if (!grupo) throw new NotFoundError('Grupo');

    if (dto.idEmpleado) {
      const empleado = await db.empleado.findFirst({ where: { id: dto.idEmpleado, ...whereEsc(idEsc) } });
      if (!empleado) throw new NotFoundError('Empleado');
    }

    const slotExiste = await db.horarioSlot.findFirst({
      where: {
        idGrupo:   dto.idGrupo,
        diaSemana: dto.diaSemana,
        hInicio:   dto.hInicio,
        activo:    true,
      },
    });
    if (slotExiste) throw new ConflictError('Ya existe un slot en ese grupo, dia y hora');

    return db.horarioSlot.create({
      data:    dto,
      include: { grupo: { include: { grado: true } }, materia: true, empleado: { include: { persona: true } } },
    });
  }

  static async softDelete(id: string, idEsc: string) {
    const slot = await db.horarioSlot.findFirst({
      where: { id, activo: true },
      include: { grupo: true },
    });
    if (!slot) throw new NotFoundError('Slot de horario');
    if (slot.grupo && slot.grupo.idEsc !== idEsc) throw new NotFoundError('Slot de horario');

    return db.horarioSlot.update({ where: { id }, data: { activo: false } });
  }
}

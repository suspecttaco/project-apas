import { db, whereEsc } from '../../lib/db';
import { NotFoundError, ConflictError } from '../../lib/errors';
import { CreateHorarioSlotDTO, UpdateHorarioSlotDTO } from './horario.schema';

export class HorarioService {

  static async getByEmpleado(idEmpleado: string, idEsc: string) {
    const empleado = await db.empleado.findFirst({
      where: {
        id: idEmpleado,
        activo: true,
        OR: [
          { idEsc },
          { plazas: { some: { idEsc, activo: true } } },
        ],
      },
    });
    if (!empleado) throw new NotFoundError('Empleado');

    return db.horarioSlot.findMany({
      where:   { idEmpleado, activo: true },
      include: { grupo: { include: { grado: true, escuela: true } }, materia: true },
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
    if (dto.idGrupo) {
      const grupo = await db.grupo.findFirst({ where: { id: dto.idGrupo, ...whereEsc(idEsc) } });
      if (!grupo) throw new NotFoundError('Grupo');
    }

    if (dto.idEmpleado) {
      const empleado = await db.empleado.findFirst({ where: { id: dto.idEmpleado, ...whereEsc(idEsc) } });
      if (!empleado) throw new NotFoundError('Empleado');
    }

    // Condición de traslape: el intervalo [hInicio, hFin) se superpone si
    //   existente.hInicio < nuevo.hFin  Y  existente.hFin > nuevo.hInicio
    const traslape = { diaSemana: dto.diaSemana, activo: true, hInicio: { lt: dto.hFin }, hFin: { gt: dto.hInicio } };

    // ── 1. Conflicto de grupo: ya tiene clase en ese intervalo ──
    if (dto.idGrupo) {
      const grupoConflicto = await db.horarioSlot.findFirst({
        where: { idGrupo: dto.idGrupo, ...traslape },
      });
      if (grupoConflicto) throw new ConflictError(
        `El grupo ya tiene una clase de ${grupoConflicto.hInicio} a ${grupoConflicto.hFin} ese día`
      );
    }

    // ── 2. Conflicto de maestro: ya tiene clase en CUALQUIER grupo a esa hora ──
    if (dto.idEmpleado) {
      const maestroConflicto = await db.horarioSlot.findFirst({
        where: { idEmpleado: dto.idEmpleado, ...traslape },
        include: { grupo: { include: { escuela: true, grado: true } } },
      });
      if (maestroConflicto) {
        const ref = maestroConflicto.grupo
          ? ` en ${maestroConflicto.grupo.escuela?.nombre ?? 'otra escuela'} — ${maestroConflicto.grupo.grado?.numero ?? ''}° ${maestroConflicto.grupo.nombre}`
          : '';
        throw new ConflictError(
          `El maestro ya tiene clase de ${maestroConflicto.hInicio} a ${maestroConflicto.hFin}${ref}`
        );
      }
    }

    return db.horarioSlot.create({
      data:    dto,
      include: { grupo: { include: { grado: true } }, materia: true, empleado: { include: { persona: true } } },
    });
  }

  static async update(id: string, dto: UpdateHorarioSlotDTO, idEsc: string) {
    const slot = await db.horarioSlot.findFirst({
      where: { id, activo: true },
      include: { grupo: true },
    });
    if (!slot) throw new NotFoundError('Slot de horario');
    if (slot.grupo && slot.grupo.idEsc !== idEsc) throw new NotFoundError('Slot de horario');

    if (dto.idGrupo) {
      const grupo = await db.grupo.findFirst({ where: { id: dto.idGrupo, ...whereEsc(idEsc) } });
      if (!grupo) throw new NotFoundError('Grupo');
    }
    if (dto.idEmpleado) {
      const empleado = await db.empleado.findFirst({ where: { id: dto.idEmpleado, ...whereEsc(idEsc) } });
      if (!empleado) throw new NotFoundError('Empleado');
    }

    return db.horarioSlot.update({
      where:   { id },
      data:    dto,
      include: { grupo: { include: { grado: true, escuela: true } }, materia: true, empleado: { include: { persona: true } } },
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

  // Maestros con slots en esta escuela que TAMBIEN tienen slots en otras escuelas
  static async getCompartidos(idEsc: string) {
    // Paso 1: empleados que tienen al menos un slot en un grupo de esta escuela
    const empleados = await db.empleado.findMany({
      where: {
        activo: true,
        horarioSlots: {
          some: { activo: true, grupo: { idEsc, activo: true } },
        },
      },
      include: {
        persona: true,
        horarioSlots: {
          where: { activo: true },
          include: {
            grupo:   { include: { escuela: true, grado: true, turno: true } },
            materia: true,
          },
          orderBy: [{ diaSemana: 'asc' }, { hInicio: 'asc' }],
        },
      },
      orderBy: { numControl: 'asc' },
    });

    // Paso 2: filtrar los que ADEMAS tienen slots en al menos otra escuela distinta
    const compartidos = empleados.filter(emp => {
      const escIds = new Set(
        emp.horarioSlots.map(s => s.grupo?.escuela?.id).filter(Boolean),
      );
      return escIds.size > 1;
    });

    return compartidos.map(emp => {
      const escuelaMap = new Map<string, {
        id: string; nombre: string; clave: string; slots: typeof emp.horarioSlots;
      }>();

      for (const slot of emp.horarioSlots) {
        const esc = slot.grupo?.escuela;
        if (!esc) continue;
        if (!escuelaMap.has(esc.id)) {
          escuelaMap.set(esc.id, { id: esc.id, nombre: esc.nombre, clave: esc.clave, slots: [] });
        }
        escuelaMap.get(esc.id)!.slots.push(slot);
      }

      return {
        id:         emp.id,
        rfc:        emp.rfc,
        numControl: emp.numControl,
        nombre:     `${emp.persona.appP} ${emp.persona.appM ?? ''} ${emp.persona.nombre}`.trim(),
        escuelas:   Array.from(escuelaMap.values()),
      };
    });
  }
}

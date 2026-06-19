import { db, whereEsc } from '../../lib/db';
import { NotFoundError, ConflictError } from '../../lib/errors';
import { CreateEmpleadoDTO, UpdateEmpleadoDTO } from './empleado.schema';

const includeCompleto = {
  persona: { include: { direccion: true, contacto: true } },
  preparacion: true,
  roles: { where: { activo: true }, include: { rol: true } },
};

export class EmpleadoService {

  static async getAll(idEsc: string) {
    return db.empleado.findMany({
      where: {
        activo: true,
        OR: [
          { idEsc },
          { plazas: { some: { idEsc, activo: true } } },
        ],
      },
      include: includeCompleto,
      orderBy: { numControl: 'asc' },
    });
  }

  static async getById(id: string, idEsc: string) {
    const empleado = await db.empleado.findFirst({
      where:   { id, ...whereEsc(idEsc) },
      include: includeCompleto,
    });
    if (!empleado) throw new NotFoundError('Empleado');
    return empleado;
  }

  static async create(dto: CreateEmpleadoDTO, idEsc: string) {
    const rfcExiste = await db.empleado.findFirst({ where: { rfc: dto.rfc } });
    if (rfcExiste) throw new ConflictError('El RFC ya esta registrado');

    const curpExiste = await db.empleado.findFirst({ where: { curp: dto.curp } });
    if (curpExiste) throw new ConflictError('El CURP ya esta registrado');

    const numControl = await EmpleadoService.generarNumControl(idEsc);
    const { nombre, appP, appM, rfc, curp, lugarNac, estadoCivil, fIngreso, direccion, contacto, preparacion } = dto;

    return db.$transaction(async (tx) => {
      const persona = await tx.persona.create({
        data: {
          nombre,
          appP,
          appM,
          direccion: direccion ? { create: direccion } : undefined,
          contacto:  contacto  ? { create: contacto  } : undefined,
        },
      });

      const empleado = await tx.empleado.create({
        data: {
          idPersona:   persona.id,
          idEsc,
          numControl,
          rfc,
          curp,
          lugarNac,
          estadoCivil,
          fIngreso,
          preparacion: preparacion ? { create: preparacion } : undefined,
        },
        include: includeCompleto,
      });

      return empleado;
    });
  }

  static async update(id: string, dto: UpdateEmpleadoDTO, idEsc: string) {
    const empleado = await EmpleadoService.getById(id, idEsc);

    if (dto.rfc && dto.rfc !== empleado.rfc) {
      const existe = await db.empleado.findFirst({ where: { rfc: dto.rfc, NOT: { id } } });
      if (existe) throw new ConflictError('El RFC ya esta registrado');
    }

    if (dto.curp && dto.curp !== empleado.curp) {
      const existe = await db.empleado.findFirst({ where: { curp: dto.curp, NOT: { id } } });
      if (existe) throw new ConflictError('El CURP ya esta registrado');
    }

    const { nombre, appP, appM, rfc, curp, lugarNac, estadoCivil, fIngreso, direccion, contacto, preparacion } = dto;

    return db.$transaction(async (tx) => {
      if (nombre || appP || appM !== undefined) {
        await tx.persona.update({
          where: { id: empleado.idPersona },
          data: {
            ...(nombre !== undefined && { nombre }),
            ...(appP   !== undefined && { appP   }),
            ...(appM   !== undefined && { appM   }),
          },
        });
      }

      if (direccion) {
        await tx.personaDirec.upsert({
          where:  { idPersona: empleado.idPersona },
          update: direccion,
          create: { idPersona: empleado.idPersona, ...direccion },
        });
      }

      if (contacto) {
        await tx.personaContact.upsert({
          where:  { idPersona: empleado.idPersona },
          update: contacto,
          create: { idPersona: empleado.idPersona, ...contacto },
        });
      }

      if (preparacion) {
        await tx.preparacionProf.upsert({
          where:  { idEmpleado: id },
          update: preparacion,
          create: { idEmpleado: id, ...preparacion },
        });
      }

      return tx.empleado.update({
        where: { id },
        data: {
          ...(rfc         !== undefined && { rfc         }),
          ...(curp        !== undefined && { curp        }),
          ...(lugarNac    !== undefined && { lugarNac    }),
          ...(estadoCivil !== undefined && { estadoCivil }),
          ...(fIngreso    !== undefined && { fIngreso    }),
        },
        include: includeCompleto,
      });
    });
  }

  static async softDelete(id: string, idEsc: string) {
    await EmpleadoService.getById(id, idEsc);
    return db.empleado.update({ where: { id }, data: { activo: false } });
  }

  private static async generarNumControl(idEsc: string): Promise<string> {
    const count = await db.empleado.count({ where: { idEsc, activo: true } });
    return String(count + 2);
  }
}

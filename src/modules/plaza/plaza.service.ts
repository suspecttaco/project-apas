import { db, whereEsc } from '../../lib/db';
import { NotFoundError, ConflictError } from '../../lib/errors';
import { CreatePlazaDTO, UpdatePlazaDTO } from './plaza.schema';

const includeCompleto = {
  nombramiento: true,
  materia:      true,
  grupos: { include: { grupo: { include: { grado: true } } } },
};

export class PlazaService {

  static async getAll(idEsc: string) {
    return db.plaza.findMany({
      where:   whereEsc(idEsc),
      include: includeCompleto,
      orderBy: { fCre: 'asc' },
    });
  }

  static async getById(id: string, idEsc: string) {
    const plaza = await db.plaza.findFirst({
      where:   { id, ...whereEsc(idEsc) },
      include: includeCompleto,
    });
    if (!plaza) throw new NotFoundError('Plaza');
    return plaza;
  }

  static async create(dto: CreatePlazaDTO, idEsc: string) {
    const empleado = await db.empleado.findFirst({ where: { id: dto.idEmpleado, ...whereEsc(idEsc) } });
    if (!empleado) throw new NotFoundError('Empleado');

    const existeCodigo = await db.plaza.findFirst({
      where: { codigoPlaza: dto.codigoPlaza, idEsc, activo: true },
    });
    if (existeCodigo) throw new ConflictError('Ya existe una plaza con ese codigo en esta escuela');

    const { idGrupos, ...plazaData } = dto;

    return db.$transaction(async (tx) => {
      const plaza = await tx.plaza.create({
        data: { ...plazaData, idEsc },
      });

      if (idGrupos && idGrupos.length > 0) {
        await tx.plazaGrupo.createMany({
          data: idGrupos.map(idGrupo => ({ idPlaza: plaza.id, idGrupo })),
        });
      }

      return tx.plaza.findFirst({
        where:   { id: plaza.id },
        include: includeCompleto,
      });
    });
  }

  static async update(id: string, dto: UpdatePlazaDTO, idEsc: string) {
    await PlazaService.getById(id, idEsc);

    if (dto.codigoPlaza) {
      const existe = await db.plaza.findFirst({
        where: { codigoPlaza: dto.codigoPlaza, idEsc, activo: true, NOT: { id } },
      });
      if (existe) throw new ConflictError('Ya existe una plaza con ese codigo en esta escuela');
    }

    const { idGrupos, ...plazaData } = dto;

    return db.$transaction(async (tx) => {
      if (idGrupos !== undefined) {
        await tx.plazaGrupo.deleteMany({ where: { idPlaza: id } });
        if (idGrupos.length > 0) {
          await tx.plazaGrupo.createMany({
            data: idGrupos.map(idGrupo => ({ idPlaza: id, idGrupo })),
          });
        }
      }

      return tx.plaza.update({
        where:   { id },
        data:    plazaData,
        include: includeCompleto,
      });
    });
  }

  static async softDelete(id: string, idEsc: string) {
    await PlazaService.getById(id, idEsc);
    return db.plaza.update({ where: { id }, data: { activo: false } });
  }
}

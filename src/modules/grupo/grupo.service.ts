import { db, whereEsc } from '../../lib/db';
import { NotFoundError, ConflictError } from '../../lib/errors';
import { CreateGrupoDTO, UpdateGrupoDTO } from './grupo.schema';

export class GrupoService {

  static async getAll(idEsc: string) {
    return db.grupo.findMany({
      where:   whereEsc(idEsc),
      orderBy: [{ idGrado: 'asc' }, { nombre: 'asc' }],
    });
  }

  static async getById(id: string, idEsc: string) {
    const grupo = await db.grupo.findFirst({ where: { id, ...whereEsc(idEsc) } });
    if (!grupo) throw new NotFoundError('Grupo');
    return grupo;
  }

  static async create(dto: CreateGrupoDTO, idEsc: string) {
    const existe = await db.grupo.findFirst({
      where: { nombre: dto.nombre, idGrado: dto.idGrado, idTurno: dto.idTurno, idEsc, activo: true },
    });
    if (existe) throw new ConflictError('Ya existe un grupo con ese nombre para ese grado y turno');

    return db.$transaction(async (tx) => {
      const grupo = await tx.grupo.create({ data: { ...dto, idEsc } });

      const cicloActivo = await tx.ciclo.findFirst({ where: { idEsc, activo: true } });
      if (cicloActivo) {
        await tx.estadisticaAlumnos.create({
          data: { idCiclo: cicloActivo.id, idGrupo: grupo.id },
        });
      }

      return grupo;
    });
  }

  static async update(id: string, dto: UpdateGrupoDTO, idEsc: string) {
    await GrupoService.getById(id, idEsc);

    if (dto.nombre || dto.idGrado || dto.idTurno) {
      const grupo = await db.grupo.findFirst({ where: { id } }) as { idGrado: string; idTurno: string; nombre: string };
      const nombre  = dto.nombre  ?? grupo.nombre;
      const idGrado = dto.idGrado ?? grupo.idGrado;
      const idTurno = dto.idTurno ?? grupo.idTurno;

      const existe = await db.grupo.findFirst({
        where: { nombre, idGrado, idTurno, idEsc, activo: true, NOT: { id } },
      });
      if (existe) throw new ConflictError('Ya existe un grupo con ese nombre para ese grado y turno');
    }

    return db.grupo.update({ where: { id }, data: dto });
  }

  static async softDelete(id: string, idEsc: string) {
    await GrupoService.getById(id, idEsc);
    return db.grupo.update({ where: { id }, data: { activo: false } });
  }
}

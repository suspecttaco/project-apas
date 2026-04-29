import { db } from '../../lib/db';
import { NotFoundError } from '../../lib/errors';
import { UpdateEstadisticaDTO } from './estadistica.schema';

function calcular(stat: {
  inscH: number; inscM: number;
  altasH: number; altasM: number;
  bajasH: number; bajasM: number;
}) {
  const existenciaH = stat.inscH + stat.altasH - stat.bajasH;
  const existenciaM = stat.inscM + stat.altasM - stat.bajasM;
  const existenciaT = existenciaH + existenciaM;
  const desercionH  = stat.inscH > 0 ? (stat.bajasH / stat.inscH) * 100 : 0;
  const desercionM  = stat.inscM > 0 ? (stat.bajasM / stat.inscM) * 100 : 0;
  return { existenciaH, existenciaM, existenciaT, desercionH, desercionM };
}

const includeCompleto = {
  grupo: { include: { grado: true, turno: true } },
  ciclo: true,
};

export class EstadisticaService {

  static async getAll(idEsc: string) {
    const stats = await db.estadisticaAlumnos.findMany({
      where:   { grupo: { idEsc, activo: true } },
      include: includeCompleto,
      orderBy: { grupo: { grado: { numero: 'asc' } } },
    });
    return stats.map(s => ({ ...s, ...calcular(s) }));
  }

  static async getById(id: string, idEsc: string) {
    const stat = await db.estadisticaAlumnos.findFirst({
      where:   { id, grupo: { idEsc, activo: true } },
      include: includeCompleto,
    });
    if (!stat) throw new NotFoundError('Estadistica');
    return { ...stat, ...calcular(stat) };
  }

  static async update(id: string, dto: UpdateEstadisticaDTO, idEsc: string) {
    await EstadisticaService.getById(id, idEsc);
    const stat = await db.estadisticaAlumnos.update({ where: { id }, data: dto, include: includeCompleto });
    return { ...stat, ...calcular(stat) };
  }
}

import { db } from '../../lib/db';
import { NotFoundError, ConflictError } from '../../lib/errors';
import { CreateNombramientoDTO, UpdateNombramientoDTO } from './nombramiento.schema';

export class NombramientoService {

  static async getAll() {
    return db.nombramiento.findMany({
      where:   { activo: true },
      orderBy: { nombre: 'asc' },
    });
  }

  static async getById(id: string) {
    const nombramiento = await db.nombramiento.findFirst({ where: { id, activo: true } });
    if (!nombramiento) throw new NotFoundError('Nombramiento');
    return nombramiento;
  }

  static async create(dto: CreateNombramientoDTO) {
    const existe = await db.nombramiento.findFirst({ where: { nombre: dto.nombre } });
    if (existe) throw new ConflictError('Ya existe un nombramiento con ese nombre');

    return db.nombramiento.create({ data: dto });
  }

  static async update(id: string, dto: UpdateNombramientoDTO) {
    await NombramientoService.getById(id);

    if (dto.nombre) {
      const existe = await db.nombramiento.findFirst({
        where: { nombre: dto.nombre, NOT: { id } },
      });
      if (existe) throw new ConflictError('Ya existe un nombramiento con ese nombre');
    }

    return db.nombramiento.update({ where: { id }, data: dto });
  }

  static async softDelete(id: string) {
    await NombramientoService.getById(id);
    return db.nombramiento.update({ where: { id }, data: { activo: false } });
  }
}
import fs   from 'fs';
import path from 'path';
import { db } from '../../lib/db';
import { NotFoundError, ConflictError } from '../../lib/errors';
import { CreateEscuelaDTO, UpdateEscuelaDTO } from './escuela.schema';

export class EscuelaService {

  static async getAll() {
    return db.escuela.findMany({
      where:   { activo: true },
      orderBy: { fCre: 'asc' },
    });
  }

  static async getById(id: string) {
    const escuela = await db.escuela.findFirst({
      where:   { id, activo: true },
      include: {
        usuarios: {
          where:   { activo: true },
          include: { rol: true },
        },
      },
    });
    if (!escuela) throw new NotFoundError('Escuela');
    return escuela;
  }

  static async create(dto: CreateEscuelaDTO) {
    const existe = await db.escuela.findFirst({ where: { clave: dto.clave } });
    if (existe) throw new ConflictError('Ya existe una escuela con esa clave');

    return db.escuela.create({ data: dto });
  }

  static async update(id: string, dto: UpdateEscuelaDTO) {
    await EscuelaService.getById(id);

    if (dto.clave) {
      const existe = await db.escuela.findFirst({
        where: { clave: dto.clave, NOT: { id } },
      });
      if (existe) throw new ConflictError('Ya existe una escuela con esa clave');
    }

    return db.escuela.update({ where: { id }, data: dto });
  }

  static async softDelete(id: string) {
    await EscuelaService.getById(id);
    return db.escuela.update({ where: { id }, data: { activo: false } });
  }

  static async setLogo(id: string, newLogoUrl: string) {
    const escuela = await db.escuela.findFirst({ where: { id, activo: true } });
    if (!escuela) throw new NotFoundError('Escuela');
    // Eliminar archivo anterior si tiene extensión diferente
    if (escuela.logoUrl && escuela.logoUrl !== newLogoUrl) {
      try { fs.unlinkSync(path.join(process.cwd(), escuela.logoUrl.replace(/^\//, ''))); } catch {}
    }
    return db.escuela.update({ where: { id }, data: { logoUrl: newLogoUrl } });
  }

  static async clearLogo(id: string) {
    const escuela = await db.escuela.findFirst({ where: { id, activo: true } });
    if (!escuela) throw new NotFoundError('Escuela');
    if (escuela.logoUrl) {
      try { fs.unlinkSync(path.join(process.cwd(), escuela.logoUrl.replace(/^\//, ''))); } catch {}
    }
    return db.escuela.update({ where: { id }, data: { logoUrl: null } });
  }
}
import bcrypt from 'bcrypt';
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
      include: { directores: { where: { activo: true }, select: { id: true, nombre: true, correo: true } } },
    });
    if (!escuela) throw new NotFoundError('Escuela');
    return escuela;
  }

  static async create(dto: CreateEscuelaDTO) {
    const existe = await db.escuela.findFirst({ where: { clave: dto.clave } });
    if (existe) throw new ConflictError('Ya existe una escuela con esa clave');

    const correoExiste = await db.usuarioDirector.findFirst({
      where: { correo: dto.director.correo },
    });
    if (correoExiste) throw new ConflictError('El correo del director ya esta registrado');

    const hash = await bcrypt.hash(dto.director.contra, 12);

    const escuela = await db.escuela.create({
      data: {
        nombre:       dto.nombre,
        clave:        dto.clave,
        zonaEscolar:  dto.zonaEscolar,
        nivel:        dto.nivel,
        numTel:       dto.numTel,
        correo:       dto.correo,
        domicilio:    dto.domicilio,
        localidad:    dto.localidad,
        municipio:    dto.municipio,
        estado:       dto.estado,
        codigoPostal: dto.codigoPostal,
        directores: {
          create: {
            nombre: dto.director.nombre,
            correo: dto.director.correo,
            contra: hash,
          },
        },
      },
    });

    return escuela;
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
}
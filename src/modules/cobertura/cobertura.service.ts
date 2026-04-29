import { db, whereEsc } from '../../lib/db';
import { NotFoundError, ConflictError } from '../../lib/errors';
import { CreateCoberturaDTO } from './cobertura.schema';

export class CoberturaService {

  static async getAll(idEsc: string) {
    return db.cobertura.findMany({
      where: {
        activo: true,
        titular: { idEsc },
      },
      include: {
        titular:  { include: { persona: true } },
        suplente: { include: { persona: true } },
      },
      orderBy: { fCre: 'desc' },
    });
  }

  static async getById(id: string, idEsc: string) {
    const cobertura = await db.cobertura.findFirst({
      where: { id, activo: true, titular: { idEsc } },
      include: {
        titular:  { include: { persona: true } },
        suplente: { include: { persona: true } },
      },
    });
    if (!cobertura) throw new NotFoundError('Cobertura');
    return cobertura;
  }

  static async abrir(dto: CreateCoberturaDTO, idEsc: string) {
    const titular = await db.empleado.findFirst({
      where: { id: dto.idEmpleadoTitular, ...whereEsc(idEsc) },
    });
    if (!titular) throw new NotFoundError('Empleado titular');

    const suplente = await db.empleado.findFirst({
      where: { id: dto.idEmpleadoCubre, ...whereEsc(idEsc) },
    });
    if (!suplente) throw new NotFoundError('Empleado suplente');

    if (dto.idEmpleadoTitular === dto.idEmpleadoCubre) {
      throw new ConflictError('El titular y el suplente no pueden ser el mismo empleado');
    }

    const coberturaActiva = await db.cobertura.findFirst({
      where: { idEmpleadoCubre: dto.idEmpleadoCubre, fFin: null, activo: true },
    });
    if (coberturaActiva) throw new ConflictError('El suplente ya tiene una cobertura activa');

    const conteo = await db.cobertura.count({
      where: { idEmpleadoTitular: dto.idEmpleadoTitular, fFin: null, activo: true },
    });
    const numControlTemp = `${titular.numControl}.${conteo + 1}`;

    return db.cobertura.create({
      data: {
        idEmpleadoTitular: dto.idEmpleadoTitular,
        idEmpleadoCubre:   dto.idEmpleadoCubre,
        numControlTemp,
        fInicio: dto.fInicio,
        motivo:  dto.motivo,
      },
      include: {
        titular:  { include: { persona: true } },
        suplente: { include: { persona: true } },
      },
    });
  }

  static async cerrar(id: string, idEsc: string) {
    const cobertura = await db.cobertura.findFirst({
      where: { id, activo: true, titular: { idEsc } },
    });
    if (!cobertura) throw new NotFoundError('Cobertura');
    if (cobertura.fFin) throw new ConflictError('La cobertura ya esta cerrada');

    return db.cobertura.update({
      where: { id },
      data:  { fFin: new Date() },
      include: {
        titular:  { include: { persona: true } },
        suplente: { include: { persona: true } },
      },
    });
  }
}

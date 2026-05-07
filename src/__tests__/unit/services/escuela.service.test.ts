import { describe, it, expect, beforeEach } from 'vitest';
import { mockPrisma } from '../../mocks/prisma.mock';
import { EscuelaService } from '../../../modules/escuela/escuela.service';
import { NotFoundError, ConflictError } from '../../../lib/errors';
import { mockReset } from 'vitest-mock-extended';

const escuelaBase = {
  id:           'uuid-escuela',
  nombre:       'Secundaria Lazaro Cardenas',
  clave:        'SIN0001',
  zonaEscolar:  'Z001',
  nivel:        'Secundaria',
  numTel:       null,
  correo:       null,
  domicilio:    null,
  localidad:    null,
  municipio:    null,
  estado:       null,
  codigoPostal: null,
  activo:       true,
  fCre:         new Date(),
  fMod:         new Date(),
  directores:   [],
};

beforeEach(() => {
  mockReset(mockPrisma);
});

describe('EscuelaService', () => {

  describe('getAll', () => {
    it('debe retornar lista de escuelas activas', async () => {
      mockPrisma.escuela.findMany.mockResolvedValue([escuelaBase]);

      const result = await EscuelaService.getAll();

      expect(result).toHaveLength(1);
      expect(mockPrisma.escuela.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { activo: true } })
      );
    });
  });

  describe('getById', () => {
    it('debe retornar la escuela si existe', async () => {
      mockPrisma.escuela.findFirst.mockResolvedValue(escuelaBase as any);

      const result = await EscuelaService.getById('uuid-escuela');

      expect(result.id).toBe('uuid-escuela');
    });

    it('debe lanzar NotFoundError si no existe', async () => {
      mockPrisma.escuela.findFirst.mockResolvedValue(null);

      await expect(
        EscuelaService.getById('uuid-inexistente')
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('create', () => {
    it('debe crear la escuela y el usuario director correctamente', async () => {
      mockPrisma.escuela.findFirst.mockResolvedValue(null);
      mockPrisma.usuarioDirector.findFirst.mockResolvedValue(null);
      mockPrisma.escuela.create.mockResolvedValue(escuelaBase);

      const result = await EscuelaService.create({
        nombre:      'Secundaria Lazaro Cardenas',
        clave:       'SIN0001',
        zonaEscolar: 'Z001',
        nivel:       'Secundaria',
        director: {
          nombre: 'Juan Perez',
          correo: 'director@escuela.mx',
          contra: 'director123',
        },
      });

      expect(mockPrisma.escuela.create).toHaveBeenCalledOnce();
      expect(result.clave).toBe('SIN0001');
    });

    it('debe lanzar ConflictError si la clave ya existe', async () => {
      mockPrisma.escuela.findFirst.mockResolvedValue(escuelaBase);

      await expect(
        EscuelaService.create({
          nombre:      'Otra Escuela',
          clave:       'SIN0001',
          zonaEscolar: 'Z001',
          nivel:       'Secundaria',
          director: {
            nombre: 'Director',
            correo: 'director2@escuela.mx',
            contra: 'director123',
          },
        })
      ).rejects.toThrow(ConflictError);
    });

    it('debe lanzar ConflictError si el correo del director ya existe', async () => {
      mockPrisma.escuela.findFirst.mockResolvedValue(null);
      mockPrisma.usuarioDirector.findFirst.mockResolvedValue({
        id: 'uuid-director',
        correo: 'director@escuela.mx',
      } as any);

      await expect(
        EscuelaService.create({
          nombre:      'Nueva Escuela',
          clave:       'SIN0002',
          zonaEscolar: 'Z001',
          nivel:       'Secundaria',
          director: {
            nombre: 'Director',
            correo: 'director@escuela.mx',
            contra: 'director123',
          },
        })
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('update', () => {
    it('debe actualizar la escuela correctamente', async () => {
      mockPrisma.escuela.findFirst
        .mockResolvedValueOnce(escuelaBase as any)
        .mockResolvedValueOnce(null);

      mockPrisma.escuela.update.mockResolvedValue({
        ...escuelaBase,
        nombre: 'Nuevo Nombre',
      });

      const result = await EscuelaService.update('uuid-escuela', { nombre: 'Nuevo Nombre' });

      expect(result.nombre).toBe('Nuevo Nombre');
    });

    it('debe lanzar ConflictError si la nueva clave ya existe en otra escuela', async () => {
      mockPrisma.escuela.findFirst
        .mockResolvedValueOnce(escuelaBase as any)
        .mockResolvedValueOnce({ ...escuelaBase, id: 'otra-escuela' } as any);

      await expect(
        EscuelaService.update('uuid-escuela', { clave: 'SIN0002' })
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('softDelete', () => {
    it('debe hacer soft delete correctamente', async () => {
      mockPrisma.escuela.findFirst.mockResolvedValue(escuelaBase as any);
      mockPrisma.escuela.update.mockResolvedValue({ ...escuelaBase, activo: false });

      await EscuelaService.softDelete('uuid-escuela');

      expect(mockPrisma.escuela.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { activo: false } })
      );
    });

    it('debe lanzar NotFoundError si la escuela no existe', async () => {
      mockPrisma.escuela.findFirst.mockResolvedValue(null);

      await expect(
        EscuelaService.softDelete('uuid-inexistente')
      ).rejects.toThrow(NotFoundError);
    });
  });
});
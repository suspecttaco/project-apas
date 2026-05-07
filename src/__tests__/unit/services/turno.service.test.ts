import { describe, it, expect, beforeEach } from 'vitest';
import { mockPrisma } from '../../mocks/prisma.mock';
import { TurnoService } from '../../../modules/turno/turno.service';
import { NotFoundError, ConflictError } from '../../../lib/errors';
import { mockReset } from 'vitest-mock-extended';

const idEsc = 'uuid-escuela';

const turnoBase = {
  id:      'uuid-turno',
  idEsc,
  nombre:  'Matutino',
  desc:    null,
  hInicio: '07:00',
  hFin:    '13:00',
  activo:  true,
  fCre:    new Date(),
  fMod:    new Date(),
};

beforeEach(() => {
  mockReset(mockPrisma);
});

describe('TurnoService', () => {

  describe('getAll', () => {
    it('debe retornar lista de turnos de la escuela', async () => {
      mockPrisma.turno.findMany.mockResolvedValue([turnoBase]);

      const result = await TurnoService.getAll(idEsc);

      expect(result).toHaveLength(1);
      expect(mockPrisma.turno.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ idEsc }) })
      );
    });
  });

  describe('getById', () => {
    it('debe retornar el turno si existe', async () => {
      mockPrisma.turno.findFirst.mockResolvedValue(turnoBase);

      const result = await TurnoService.getById('uuid-turno', idEsc);

      expect(result.id).toBe('uuid-turno');
    });

    it('debe lanzar NotFoundError si no existe', async () => {
      mockPrisma.turno.findFirst.mockResolvedValue(null);

      await expect(
        TurnoService.getById('uuid-inexistente', idEsc)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('create', () => {
    it('debe crear el turno correctamente', async () => {
      mockPrisma.turno.findFirst.mockResolvedValue(null);
      mockPrisma.turno.create.mockResolvedValue(turnoBase);

      const result = await TurnoService.create(
        { nombre: 'Matutino', hInicio: '07:00', hFin: '13:00' },
        idEsc
      );

      expect(result.nombre).toBe('Matutino');
      expect(mockPrisma.turno.create).toHaveBeenCalledOnce();
    });

    it('debe lanzar ConflictError si el nombre ya existe en la escuela', async () => {
      mockPrisma.turno.findFirst.mockResolvedValue(turnoBase);

      await expect(
        TurnoService.create(
          { nombre: 'Matutino', hInicio: '07:00', hFin: '13:00' },
          idEsc
        )
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('update', () => {
    it('debe actualizar el turno correctamente', async () => {
      mockPrisma.turno.findFirst
        .mockResolvedValueOnce(turnoBase)
        .mockResolvedValueOnce(null);

      mockPrisma.turno.update.mockResolvedValue({ ...turnoBase, hFin: '14:00' });

      const result = await TurnoService.update('uuid-turno', { hFin: '14:00' }, idEsc);

      expect(result.hFin).toBe('14:00');
    });

    it('debe lanzar ConflictError si el nuevo nombre ya existe en otro turno', async () => {
      mockPrisma.turno.findFirst
        .mockResolvedValueOnce(turnoBase)
        .mockResolvedValueOnce({ ...turnoBase, id: 'otro-turno' });

      await expect(
        TurnoService.update('uuid-turno', { nombre: 'Vespertino' }, idEsc)
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('softDelete', () => {
    it('debe hacer soft delete correctamente', async () => {
      mockPrisma.turno.findFirst.mockResolvedValue(turnoBase);
      mockPrisma.turno.update.mockResolvedValue({ ...turnoBase, activo: false });

      await TurnoService.softDelete('uuid-turno', idEsc);

      expect(mockPrisma.turno.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { activo: false } })
      );
    });

    it('debe lanzar NotFoundError si el turno no existe', async () => {
      mockPrisma.turno.findFirst.mockResolvedValue(null);

      await expect(
        TurnoService.softDelete('uuid-inexistente', idEsc)
      ).rejects.toThrow(NotFoundError);
    });
  });
});
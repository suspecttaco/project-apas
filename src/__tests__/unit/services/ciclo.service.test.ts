import { describe, it, expect, beforeEach } from 'vitest';
import { mockPrisma } from '../../mocks/prisma.mock';
import { CicloService } from '../../../modules/ciclo/ciclo.service';
import { NotFoundError, ConflictError } from '../../../lib/errors';
import { mockReset } from 'vitest-mock-extended';

beforeEach(() => {
  mockReset(mockPrisma);
});

const idEsc  = 'uuid-escuela';
const idPlan = 'uuid-plan';

const cicloBase = {
  id:      'uuid-ciclo',
  idPlan,
  idEsc,
  nombre:  '2024-2025',
  fInicio: new Date('2024-08-26'),
  fFin:    new Date('2025-07-11'),
  activo:  false,
  fCre:    new Date(),
  fMod:    new Date(),
};

describe('CicloService', () => {

  describe('getAll', () => {
    it('debe retornar lista de ciclos de la escuela', async () => {
      mockPrisma.ciclo.findMany.mockResolvedValue([cicloBase]);
      const result = await CicloService.getAll(idEsc);
      expect(result).toHaveLength(1);
      expect(mockPrisma.ciclo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ idEsc }) })
      );
    });
  });

  describe('getById', () => {
    it('debe retornar el ciclo si existe', async () => {
      mockPrisma.ciclo.findFirst.mockResolvedValue(cicloBase);
      const result = await CicloService.getById('uuid-ciclo', idEsc);
      expect(result.id).toBe('uuid-ciclo');
    });

    it('debe lanzar NotFoundError si no existe', async () => {
      mockPrisma.ciclo.findFirst.mockResolvedValue(null);
      await expect(
        CicloService.getById('uuid-inexistente', idEsc)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('create', () => {
    it('debe crear el ciclo correctamente', async () => {
      mockPrisma.ciclo.findFirst.mockResolvedValue(null);
      mockPrisma.ciclo.create.mockResolvedValue({ ...cicloBase, activo: false });

      const result = await CicloService.create(
        { idPlan, nombre: '2024-2025', fInicio: new Date('2024-08-26'), fFin: new Date('2025-07-11') },
        idEsc
      );

      expect(result.activo).toBe(false);
      expect(mockPrisma.ciclo.create).toHaveBeenCalledOnce();
    });

    it('debe lanzar ConflictError si el nombre ya existe en la escuela', async () => {
      mockPrisma.ciclo.findFirst.mockResolvedValue(cicloBase);

      await expect(
        CicloService.create(
          { idPlan, nombre: '2024-2025', fInicio: new Date(), fFin: new Date() },
          idEsc
        )
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('softDelete', () => {
    it('debe lanzar ConflictError si el ciclo esta activo', async () => {
      mockPrisma.ciclo.findFirst.mockResolvedValue({ ...cicloBase, activo: true });

      await expect(
        CicloService.softDelete('uuid-ciclo', idEsc)
      ).rejects.toThrow(ConflictError);
    });

    it('debe hacer soft delete si el ciclo no esta activo', async () => {
      mockPrisma.ciclo.findFirst.mockResolvedValue({ ...cicloBase, activo: false });
      mockPrisma.ciclo.update.mockResolvedValue({ ...cicloBase, activo: false });

      await CicloService.softDelete('uuid-ciclo', idEsc);

      expect(mockPrisma.ciclo.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { activo: false } })
      );
    });
  });

  describe('activar', () => {
    it('debe desactivar el ciclo activo anterior y activar el nuevo', async () => {
      mockPrisma.ciclo.findFirst.mockResolvedValue(cicloBase);
      mockPrisma.ciclo.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.ciclo.update.mockResolvedValue({ ...cicloBase, activo: true });

      const result = await CicloService.activar('uuid-ciclo', idEsc);

      expect(mockPrisma.ciclo.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ idEsc, activo: true }) })
      );
      expect(mockPrisma.ciclo.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { activo: true } })
      );
      expect(result.activo).toBe(true);
    });

    it('debe lanzar NotFoundError si el ciclo no existe', async () => {
      mockPrisma.ciclo.findFirst.mockResolvedValue(null);

      await expect(
        CicloService.activar('uuid-inexistente', idEsc)
      ).rejects.toThrow(NotFoundError);
    });
  });
});
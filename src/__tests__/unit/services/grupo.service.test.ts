import { describe, it, expect, beforeEach } from 'vitest';
import { mockPrisma } from '../../mocks/prisma.mock';
import { GrupoService } from '../../../modules/grupo/grupo.service';
import { NotFoundError, ConflictError } from '../../../lib/errors';
import { mockReset } from 'vitest-mock-extended';

const idEsc = 'uuid-escuela';

const grupoBase = {
  id:      'uuid-grupo',
  idEsc,
  idGrado: 'uuid-grado',
  idTurno: 'uuid-turno',
  nombre:  'A',
  activo:  true,
  fCre:    new Date(),
  fMod:    new Date(),
};

beforeEach(() => {
  mockReset(mockPrisma);
});

describe('GrupoService', () => {

  describe('getAll', () => {
    it('debe retornar lista de grupos de la escuela', async () => {
      mockPrisma.grupo.findMany.mockResolvedValue([grupoBase]);

      const result = await GrupoService.getAll(idEsc);

      expect(result).toHaveLength(1);
      expect(mockPrisma.grupo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ idEsc }) })
      );
    });
  });

  describe('getById', () => {
    it('debe retornar el grupo si existe', async () => {
      mockPrisma.grupo.findFirst.mockResolvedValue(grupoBase);

      const result = await GrupoService.getById('uuid-grupo', idEsc);

      expect(result.id).toBe('uuid-grupo');
    });

    it('debe lanzar NotFoundError si no existe', async () => {
      mockPrisma.grupo.findFirst.mockResolvedValue(null);

      await expect(
        GrupoService.getById('uuid-inexistente', idEsc)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('create', () => {
    it('debe crear el grupo y su estadistica si hay ciclo activo', async () => {
      mockPrisma.grupo.findFirst.mockResolvedValue(null);

      mockPrisma.$transaction.mockImplementation(async (fn: any) => fn(mockPrisma));

      mockPrisma.grupo.create.mockResolvedValue(grupoBase);
      mockPrisma.ciclo.findFirst.mockResolvedValue({
        id:      'uuid-ciclo',
        idEsc,
        activo:  true,
        nombre:  '2024-2025',
        idPlan:  'uuid-plan',
        fInicio: new Date(),
        fFin:    new Date(),
        fCre:    new Date(),
        fMod:    new Date(),
      });
      mockPrisma.estadisticaAlumnos.create.mockResolvedValue({} as any);

      await GrupoService.create(
        { idGrado: 'uuid-grado', idTurno: 'uuid-turno', nombre: 'A' },
        idEsc
      );

      expect(mockPrisma.grupo.create).toHaveBeenCalledOnce();
      expect(mockPrisma.estadisticaAlumnos.create).toHaveBeenCalledOnce();
    });

    it('debe crear el grupo sin estadistica si no hay ciclo activo', async () => {
      mockPrisma.grupo.findFirst.mockResolvedValue(null);

      mockPrisma.$transaction.mockImplementation(async (fn: any) => fn(mockPrisma));

      mockPrisma.grupo.create.mockResolvedValue(grupoBase);
      mockPrisma.ciclo.findFirst.mockResolvedValue(null);

      await GrupoService.create(
        { idGrado: 'uuid-grado', idTurno: 'uuid-turno', nombre: 'A' },
        idEsc
      );

      expect(mockPrisma.grupo.create).toHaveBeenCalledOnce();
      expect(mockPrisma.estadisticaAlumnos.create).not.toHaveBeenCalled();
    });

    it('debe lanzar ConflictError si el grupo ya existe', async () => {
      mockPrisma.grupo.findFirst.mockResolvedValue(grupoBase);

      await expect(
        GrupoService.create(
          { idGrado: 'uuid-grado', idTurno: 'uuid-turno', nombre: 'A' },
          idEsc
        )
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('softDelete', () => {
    it('debe hacer soft delete correctamente', async () => {
      mockPrisma.grupo.findFirst.mockResolvedValue(grupoBase);
      mockPrisma.grupo.update.mockResolvedValue({ ...grupoBase, activo: false });

      await GrupoService.softDelete('uuid-grupo', idEsc);

      expect(mockPrisma.grupo.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { activo: false } })
      );
    });

    it('debe lanzar NotFoundError si el grupo no existe', async () => {
      mockPrisma.grupo.findFirst.mockResolvedValue(null);

      await expect(
        GrupoService.softDelete('uuid-inexistente', idEsc)
      ).rejects.toThrow(NotFoundError);
    });
  });
});
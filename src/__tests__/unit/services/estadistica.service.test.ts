import { describe, it, expect, beforeEach } from 'vitest';
import { mockPrisma } from '../../mocks/prisma.mock';
import { EstadisticaService } from '../../../modules/estadistica/estadistica.service';
import { NotFoundError } from '../../../lib/errors';
import { mockReset } from 'vitest-mock-extended';

beforeEach(() => {
  mockReset(mockPrisma);
});

const idEsc = 'uuid-escuela';

const statBase = {
  id:      'uuid-stat',
  idCiclo: 'uuid-ciclo',
  idGrupo: 'uuid-grupo',
  inscH:   15, inscM:  12,
  altasH:   1, altasM:   0,
  bajasH:   0, bajasM:   1,
  aprobTodosH:  null, aprobTodosM:  null,
  reprobH:      null, reprobM:      null,
  repetidoresH: null, repetidoresM: null,
  fCre: new Date(),
  fMod: new Date(),
  grupo: { idEsc, grado: {}, turno: {} },
  ciclo: {},
};

describe('EstadisticaService', () => {

  describe('calculos derivados', () => {
    it('debe calcular existencia correctamente', async () => {
      mockPrisma.estadisticaAlumnos.findMany.mockResolvedValue([statBase] as any);

      const result = await EstadisticaService.getAll(idEsc);

      expect(result[0].existenciaH).toBe(16); // 15 + 1 - 0
      expect(result[0].existenciaM).toBe(11); // 12 + 0 - 1
      expect(result[0].existenciaT).toBe(27);
    });

    it('debe calcular porcentaje de desercion correctamente', async () => {
      mockPrisma.estadisticaAlumnos.findMany.mockResolvedValue([statBase] as any);

      const result = await EstadisticaService.getAll(idEsc);

      expect(result[0].desercionH).toBe(0);               // 0 bajas / 15 inscritos
      expect(result[0].desercionM).toBeCloseTo(8.33, 1);  // 1 baja / 12 inscritas
    });

    it('debe retornar desercion 0 si no hay inscritos para evitar division por cero', async () => {
      mockPrisma.estadisticaAlumnos.findMany.mockResolvedValue([{
        ...statBase,
        inscH: 0, inscM: 0,
        bajasH: 0, bajasM: 0,
      }] as any);

      const result = await EstadisticaService.getAll(idEsc);

      expect(result[0].desercionH).toBe(0);
      expect(result[0].desercionM).toBe(0);
    });

    it('debe manejar correctamente existencia negativa por bajas mayores a inscritos', async () => {
      mockPrisma.estadisticaAlumnos.findMany.mockResolvedValue([{
        ...statBase,
        inscH: 5, altasH: 0, bajasH: 10,
        inscM: 5, altasM: 0, bajasM: 0,
      }] as any);

      const result = await EstadisticaService.getAll(idEsc);

      expect(result[0].existenciaH).toBe(-5);
      expect(result[0].existenciaT).toBe(0);
    });
  });

  describe('getById', () => {
    it('debe retornar la estadistica con calculos incluidos', async () => {
      mockPrisma.estadisticaAlumnos.findFirst.mockResolvedValue(statBase as any);

      const result = await EstadisticaService.getById('uuid-stat', idEsc);

      expect(result.existenciaH).toBeDefined();
      expect(result.existenciaM).toBeDefined();
      expect(result.existenciaT).toBeDefined();
    });

    it('debe lanzar NotFoundError si no existe', async () => {
      mockPrisma.estadisticaAlumnos.findFirst.mockResolvedValue(null);

      await expect(
        EstadisticaService.getById('uuid-inexistente', idEsc)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('update', () => {
    it('debe actualizar y retornar estadistica con calculos', async () => {
      mockPrisma.estadisticaAlumnos.findFirst.mockResolvedValue(statBase as any);
      mockPrisma.estadisticaAlumnos.update.mockResolvedValue({
        ...statBase,
        inscH: 20, inscM: 18,
        altasH: 2, altasM: 1,
        bajasH: 1, bajasM: 0,
      } as any);

      const result = await EstadisticaService.update(
        'uuid-stat',
        { inscH: 20, inscM: 18, altasH: 2, altasM: 1, bajasH: 1, bajasM: 0 },
        idEsc
      );

      expect(result.existenciaH).toBe(21); // 20 + 2 - 1
      expect(result.existenciaM).toBe(19); // 18 + 1 - 0
    });
  });
});
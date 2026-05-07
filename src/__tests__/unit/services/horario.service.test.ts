import { describe, it, expect, beforeEach } from 'vitest';
import { mockPrisma } from '../../mocks/prisma.mock';
import { HorarioService } from '../../../modules/horario/horario.service';
import { NotFoundError, ConflictError } from '../../../lib/errors';
import { mockReset } from 'vitest-mock-extended';

const idEsc = 'uuid-escuela';

const slotBase = {
  id:         'uuid-slot',
  idEmpleado: 'uuid-empleado',
  idGrupo:    'uuid-grupo',
  idMateria:  'uuid-materia',
  diaSemana:  'Lunes',
  hInicio:    '07:00',
  hFin:       '08:00',
  activo:     true,
  fCre:       new Date(),
  fMod:       new Date(),
  grupo:      { id: 'uuid-grupo', idEsc, nombre: 'A', grado: {} },
  materia:    { id: 'uuid-materia', nombre: 'Matematicas' },
  empleado:   { id: 'uuid-empleado', persona: { nombre: 'Juan', appP: 'Perez' } },
};

const empleadoBase = {
  id:         'uuid-empleado',
  idEsc,
  activo:     true,
  numControl: '2',
};

const grupoBase = {
  id:    'uuid-grupo',
  idEsc,
  activo: true,
};

beforeEach(() => {
  mockReset(mockPrisma);
});

describe('HorarioService', () => {

  describe('getByEmpleado', () => {
    it('debe retornar horario del empleado ordenado', async () => {
      mockPrisma.empleado.findFirst.mockResolvedValue(empleadoBase as any);
      mockPrisma.horarioSlot.findMany.mockResolvedValue([slotBase] as any);

      const result = await HorarioService.getByEmpleado('uuid-empleado', idEsc);

      expect(result).toHaveLength(1);
      expect(mockPrisma.horarioSlot.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ idEmpleado: 'uuid-empleado' }),
        })
      );
    });

    it('debe lanzar NotFoundError si el empleado no existe', async () => {
      mockPrisma.empleado.findFirst.mockResolvedValue(null);

      await expect(
        HorarioService.getByEmpleado('uuid-inexistente', idEsc)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('getByGrupo', () => {
    it('debe retornar horario del grupo ordenado', async () => {
      mockPrisma.grupo.findFirst.mockResolvedValue(grupoBase as any);
      mockPrisma.horarioSlot.findMany.mockResolvedValue([slotBase] as any);

      const result = await HorarioService.getByGrupo('uuid-grupo', idEsc);

      expect(result).toHaveLength(1);
      expect(mockPrisma.horarioSlot.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ idGrupo: 'uuid-grupo' }),
        })
      );
    });

    it('debe lanzar NotFoundError si el grupo no existe', async () => {
      mockPrisma.grupo.findFirst.mockResolvedValue(null);

      await expect(
        HorarioService.getByGrupo('uuid-inexistente', idEsc)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('create', () => {
    it('debe crear el slot correctamente', async () => {
      mockPrisma.grupo.findFirst.mockResolvedValue(grupoBase as any);
      mockPrisma.empleado.findFirst.mockResolvedValue(empleadoBase as any);
      mockPrisma.horarioSlot.findFirst.mockResolvedValue(null);
      mockPrisma.horarioSlot.create.mockResolvedValue(slotBase as any);

      const result = await HorarioService.create(
        {
          idGrupo:    'uuid-grupo',
          idEmpleado: 'uuid-empleado',
          idMateria:  'uuid-materia',
          diaSemana:  'Lunes',
          hInicio:    '07:00',
          hFin:       '08:00',
        },
        idEsc
      );

      expect(mockPrisma.horarioSlot.create).toHaveBeenCalledOnce();
    });

    it('debe lanzar ConflictError si ya existe un slot en ese grupo, dia y hora', async () => {
      mockPrisma.grupo.findFirst.mockResolvedValue(grupoBase as any);
      mockPrisma.empleado.findFirst.mockResolvedValue(empleadoBase as any);
      mockPrisma.horarioSlot.findFirst.mockResolvedValue(slotBase as any);

      await expect(
        HorarioService.create(
          {
            idGrupo:   'uuid-grupo',
            diaSemana: 'Lunes',
            hInicio:   '07:00',
            hFin:      '08:00',
          },
          idEsc
        )
      ).rejects.toThrow(ConflictError);
    });

    it('debe lanzar NotFoundError si el grupo no existe', async () => {
      mockPrisma.grupo.findFirst.mockResolvedValue(null);

      await expect(
        HorarioService.create(
          {
            idGrupo:   'uuid-inexistente',
            diaSemana: 'Lunes',
            hInicio:   '07:00',
            hFin:      '08:00',
          },
          idEsc
        )
      ).rejects.toThrow(NotFoundError);
    });

    it('debe lanzar NotFoundError si el empleado no existe', async () => {
      mockPrisma.grupo.findFirst.mockResolvedValue(grupoBase as any);
      mockPrisma.empleado.findFirst.mockResolvedValue(null);

      await expect(
        HorarioService.create(
          {
            idGrupo:    'uuid-grupo',
            idEmpleado: 'uuid-inexistente',
            diaSemana:  'Lunes',
            hInicio:    '07:00',
            hFin:       '08:00',
          },
          idEsc
        )
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('softDelete', () => {
    it('debe hacer soft delete correctamente', async () => {
      mockPrisma.horarioSlot.findFirst.mockResolvedValue(slotBase as any);
      mockPrisma.horarioSlot.update.mockResolvedValue({ ...slotBase, activo: false } as any);

      await HorarioService.softDelete('uuid-slot', idEsc);

      expect(mockPrisma.horarioSlot.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { activo: false } })
      );
    });

    it('debe lanzar NotFoundError si el slot no existe', async () => {
      mockPrisma.horarioSlot.findFirst.mockResolvedValue(null);

      await expect(
        HorarioService.softDelete('uuid-inexistente', idEsc)
      ).rejects.toThrow(NotFoundError);
    });
  });
});
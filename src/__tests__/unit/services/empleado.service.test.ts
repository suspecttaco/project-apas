import { describe, it, expect, beforeEach } from 'vitest';
import { mockPrisma } from '../../mocks/prisma.mock';
import { EmpleadoService } from '../../../modules/empleado/empleado.service';
import { NotFoundError, ConflictError } from '../../../lib/errors';
import { mockReset } from 'vitest-mock-extended';

beforeEach(() => {
  mockReset(mockPrisma);
});

const idEsc = 'uuid-escuela';

const personaBase = {
  id:     'uuid-persona',
  nombre: 'Juan',
  appP:   'Perez',
  appM:   'Lopez',
  activo: true,
  fCre:   new Date(),
  fMod:   new Date(),
  direccion: null,
  contacto:  null,
};

const empleadoBase = {
  id:          'uuid-empleado',
  idPersona:   'uuid-persona',
  idEsc,
  numControl:  '2',
  rfc:         'PELJ800101ABC',
  curp:        'PELJ800101HSLRPN01',
  lugarNac:    null,
  estadoCivil: null,
  fIngreso:    new Date(),
  activo:      true,
  fCre:        new Date(),
  fMod:        new Date(),
  persona:     personaBase,
  preparacion: null,
  roles:       [],
};

describe('EmpleadoService', () => {

  describe('getAll', () => {
    it('debe retornar lista de empleados de la escuela', async () => {
      mockPrisma.empleado.findMany.mockResolvedValue([empleadoBase] as any);

      const result = await EmpleadoService.getAll(idEsc);

      expect(result).toHaveLength(1);
      expect(mockPrisma.empleado.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ idEsc }),
        })
      );
    });
  });

  describe('getById', () => {
    it('debe retornar el empleado si existe', async () => {
      mockPrisma.empleado.findFirst.mockResolvedValue(empleadoBase as any);

      const result = await EmpleadoService.getById('uuid-empleado', idEsc);

      expect(result.id).toBe('uuid-empleado');
    });

    it('debe lanzar NotFoundError si no existe', async () => {
      mockPrisma.empleado.findFirst.mockResolvedValue(null);

      await expect(
        EmpleadoService.getById('uuid-inexistente', idEsc)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('create', () => {
    it('debe generar numControl correcto basado en empleados existentes', async () => {
      mockPrisma.empleado.findFirst
        .mockResolvedValueOnce(null)  // rfc no existe
        .mockResolvedValueOnce(null); // curp no existe

      mockPrisma.empleado.count.mockResolvedValue(1); // 1 empleado activo -> numControl = 3

      mockPrisma.$transaction.mockImplementation(async (fn: any) => fn(mockPrisma));

      mockPrisma.persona.create.mockResolvedValue(personaBase as any);
      mockPrisma.empleado.create.mockResolvedValue({
        ...empleadoBase,
        numControl: '3',
      } as any);

      const result = await EmpleadoService.create(
        {
          nombre: 'Juan', appP: 'Perez', appM: 'Lopez',
          rfc: 'PELJ800101ABC', curp: 'PELJ800101HSLRPN01',
          fIngreso: new Date(),
        },
        idEsc
      );

      expect(mockPrisma.empleado.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ numControl: '3' }),
        })
      );
    });

    it('debe lanzar ConflictError si el RFC ya existe', async () => {
      mockPrisma.empleado.findFirst.mockResolvedValue(empleadoBase as any);

      await expect(
        EmpleadoService.create(
          {
            nombre: 'Juan', appP: 'Perez',
            rfc: 'PELJ800101ABC', curp: 'PELJ800101HSLRPN01',
            fIngreso: new Date(),
          },
          idEsc
        )
      ).rejects.toThrow(ConflictError);
    });

    it('debe lanzar ConflictError si el CURP ya existe', async () => {
      mockPrisma.empleado.findFirst
        .mockResolvedValueOnce(null)              // rfc no existe
        .mockResolvedValueOnce(empleadoBase as any); // curp si existe

      await expect(
        EmpleadoService.create(
          {
            nombre: 'Juan', appP: 'Perez',
            rfc: 'NUEVO000000ABC', curp: 'PELJ800101HSLRPN01',
            fIngreso: new Date(),
          },
          idEsc
        )
      ).rejects.toThrow(ConflictError);
    });

    it('debe asignar numControl 2 si es el primer empleado de la escuela', async () => {
      mockPrisma.empleado.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      mockPrisma.empleado.count.mockResolvedValue(0); // sin empleados -> numControl = 2

      mockPrisma.$transaction.mockImplementation(async (fn: any) => fn(mockPrisma));
      mockPrisma.persona.create.mockResolvedValue(personaBase as any);
      mockPrisma.empleado.create.mockResolvedValue({
        ...empleadoBase,
        numControl: '2',
      } as any);

      await EmpleadoService.create(
        {
          nombre: 'Juan', appP: 'Perez',
          rfc: 'PELJ800101ABC', curp: 'PELJ800101HSLRPN01',
          fIngreso: new Date(),
        },
        idEsc
      );

      expect(mockPrisma.empleado.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ numControl: '2' }),
        })
      );
    });
  });

  describe('softDelete', () => {
    it('debe hacer soft delete correctamente', async () => {
      mockPrisma.empleado.findFirst.mockResolvedValue(empleadoBase as any);
      mockPrisma.empleado.update.mockResolvedValue({ ...empleadoBase, activo: false } as any);

      await EmpleadoService.softDelete('uuid-empleado', idEsc);

      expect(mockPrisma.empleado.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { activo: false } })
      );
    });

    it('debe lanzar NotFoundError si el empleado no existe', async () => {
      mockPrisma.empleado.findFirst.mockResolvedValue(null);

      await expect(
        EmpleadoService.softDelete('uuid-inexistente', idEsc)
      ).rejects.toThrow(NotFoundError);
    });
  });
});
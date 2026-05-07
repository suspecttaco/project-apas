import { describe, it, expect, beforeEach } from 'vitest';
import { mockPrisma } from '../../mocks/prisma.mock';
import { CoberturaService } from '../../../modules/cobertura/cobertura.service';
import { NotFoundError, ConflictError } from '../../../lib/errors';
import { mockReset } from 'vitest-mock-extended';

beforeEach(() => {
  mockReset(mockPrisma);
});

const idEsc = 'uuid-escuela';

const empleadoBase = (id: string, numControl: string) => ({
  id,
  idPersona:   'uuid-persona',
  idEsc,
  numControl,
  rfc:         'TEST000000AAA',
  curp:        'TEST000000HSLRPN01',
  lugarNac:    null,
  estadoCivil: null,
  fIngreso:    new Date(),
  activo:      true,
  fCre:        new Date(),
  fMod:        new Date(),
});

const coberturaBase = {
  id:                'uuid-cobertura',
  idEmpleadoTitular: 'uuid-titular',
  idEmpleadoCubre:   'uuid-suplente',
  numControlTemp:    '1.1',
  fInicio:           new Date(),
  fFin:              null,
  motivo:            null,
  activo:            true,
  fCre:              new Date(),
  fMod:              new Date(),
};

describe('CoberturaService', () => {

  describe('abrir', () => {
    it('debe generar numControlTemp correcto al abrir cobertura', async () => {
      mockPrisma.empleado.findFirst
        .mockResolvedValueOnce(empleadoBase('uuid-titular',  '1'))
        .mockResolvedValueOnce(empleadoBase('uuid-suplente', '2'));

      mockPrisma.cobertura.findFirst.mockResolvedValue(null);
      mockPrisma.cobertura.count.mockResolvedValue(0);
      mockPrisma.cobertura.create.mockResolvedValue({
        ...coberturaBase,
        numControlTemp: '1.1',
        titular:  { ...empleadoBase('uuid-titular',  '1'), persona: {} },
        suplente: { ...empleadoBase('uuid-suplente', '2'), persona: {} },
      } as any);

      const result = await CoberturaService.abrir(
        { idEmpleadoTitular: 'uuid-titular', idEmpleadoCubre: 'uuid-suplente', fInicio: new Date() },
        idEsc
      );

      expect(mockPrisma.cobertura.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ numControlTemp: '1.1' }),
        })
      );
    });

    it('debe incrementar el decimal si ya existe una cobertura activa del titular', async () => {
      mockPrisma.empleado.findFirst
        .mockResolvedValueOnce(empleadoBase('uuid-titular',  '1'))
        .mockResolvedValueOnce(empleadoBase('uuid-suplente', '3'));

      mockPrisma.cobertura.findFirst.mockResolvedValue(null);
      mockPrisma.cobertura.count.mockResolvedValue(1);
      mockPrisma.cobertura.create.mockResolvedValue({
        ...coberturaBase,
        numControlTemp: '1.2',
        titular:  { ...empleadoBase('uuid-titular',  '1'), persona: {} },
        suplente: { ...empleadoBase('uuid-suplente', '3'), persona: {} },
      } as any);

      await CoberturaService.abrir(
        { idEmpleadoTitular: 'uuid-titular', idEmpleadoCubre: 'uuid-suplente', fInicio: new Date() },
        idEsc
      );

      expect(mockPrisma.cobertura.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ numControlTemp: '1.2' }),
        })
      );
    });

    it('debe lanzar ConflictError si el suplente ya tiene cobertura activa', async () => {
      mockPrisma.empleado.findFirst
        .mockResolvedValueOnce(empleadoBase('uuid-titular',  '1'))
        .mockResolvedValueOnce(empleadoBase('uuid-suplente', '2'));

      mockPrisma.cobertura.findFirst.mockResolvedValue(coberturaBase);

      await expect(
        CoberturaService.abrir(
          { idEmpleadoTitular: 'uuid-titular', idEmpleadoCubre: 'uuid-suplente', fInicio: new Date() },
          idEsc
        )
      ).rejects.toThrow(ConflictError);
    });

    it('debe lanzar ConflictError si titular y suplente son el mismo empleado', async () => {
      mockPrisma.empleado.findFirst
        .mockResolvedValueOnce(empleadoBase('uuid-mismo', '1'))
        .mockResolvedValueOnce(empleadoBase('uuid-mismo', '1'));

      mockPrisma.cobertura.findFirst.mockResolvedValue(null);

      await expect(
        CoberturaService.abrir(
          { idEmpleadoTitular: 'uuid-mismo', idEmpleadoCubre: 'uuid-mismo', fInicio: new Date() },
          idEsc
        )
      ).rejects.toThrow(ConflictError);
    });

    it('debe lanzar NotFoundError si el titular no existe', async () => {
      mockPrisma.empleado.findFirst.mockResolvedValue(null);

      await expect(
        CoberturaService.abrir(
          { idEmpleadoTitular: 'uuid-inexistente', idEmpleadoCubre: 'uuid-suplente', fInicio: new Date() },
          idEsc
        )
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('cerrar', () => {
    it('debe cerrar la cobertura seteando fFin', async () => {
      mockPrisma.cobertura.findFirst.mockResolvedValue({
        ...coberturaBase,
        titular: empleadoBase('uuid-titular', '1'),
      } as any);

      mockPrisma.cobertura.update.mockResolvedValue({
        ...coberturaBase,
        fFin:    new Date(),
        titular: { ...empleadoBase('uuid-titular', '1'), persona: {} },
        suplente: { ...empleadoBase('uuid-suplente', '2'), persona: {} },
      } as any);

      await CoberturaService.cerrar('uuid-cobertura', idEsc);

      expect(mockPrisma.cobertura.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ fFin: expect.any(Date) }),
        })
      );
    });

    it('debe lanzar ConflictError si la cobertura ya esta cerrada', async () => {
      mockPrisma.cobertura.findFirst.mockResolvedValue({
        ...coberturaBase,
        fFin:    new Date(),
        titular: empleadoBase('uuid-titular', '1'),
      } as any);

      await expect(
        CoberturaService.cerrar('uuid-cobertura', idEsc)
      ).rejects.toThrow(ConflictError);
    });

    it('debe lanzar NotFoundError si la cobertura no existe', async () => {
      mockPrisma.cobertura.findFirst.mockResolvedValue(null);

      await expect(
        CoberturaService.cerrar('uuid-inexistente', idEsc)
      ).rejects.toThrow(NotFoundError);
    });
  });
});
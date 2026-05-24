import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockPrisma } from '../../mocks/prisma.mock';
import { RolService } from '../../../modules/rol/rol.service';
import { NotFoundError, ConflictError } from '../../../lib/errors';
import { mockReset } from 'vitest-mock-extended';

vi.mock('../../../lib/permissions', () => ({
  cargarPermisos: vi.fn().mockResolvedValue(undefined),
  tienePermiso:   vi.fn().mockReturnValue(true),
}));

const permisoBase = {
  id:     'uuid-permiso',
  nombre: 'escuelas:read',
  desc:   'Ver escuelas',
  activo: true,
  fCre:   new Date(),
  fMod:   new Date(),
};

const rolBase = {
  id:              'uuid-rol',
  nombre:          'coordinador',
  desc:            'Coordinador academico',
  requiereEscuela: false,
  activo:          true,
  fCre:            new Date(),
  fMod:            new Date(),
  permisos:        [{ id: 'uuid-rp', idRol: 'uuid-rol', idPermiso: 'uuid-permiso', permiso: permisoBase, fCre: new Date(), fMod: new Date() }],
};

beforeEach(() => {
  mockReset(mockPrisma);
  vi.clearAllMocks();
});

describe('RolService', () => {

  describe('getAll', () => {
    it('debe retornar lista de roles activos con sus permisos', async () => {
      mockPrisma.rolUsuario.findMany.mockResolvedValue([rolBase] as any);

      const result = await RolService.getAll();

      expect(result).toHaveLength(1);
      expect(mockPrisma.rolUsuario.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { activo: true } })
      );
    });
  });

  describe('getById', () => {
    it('debe retornar el rol si existe', async () => {
      mockPrisma.rolUsuario.findFirst.mockResolvedValue(rolBase as any);

      const result = await RolService.getById('uuid-rol');

      expect(result.nombre).toBe('coordinador');
    });

    it('debe lanzar NotFoundError si no existe', async () => {
      mockPrisma.rolUsuario.findFirst.mockResolvedValue(null);

      await expect(
        RolService.getById('uuid-inexistente')
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('create', () => {
    it('debe crear el rol correctamente', async () => {
      mockPrisma.rolUsuario.findFirst.mockResolvedValue(null);
      mockPrisma.rolUsuario.create.mockResolvedValue(rolBase as any);

      const result = await RolService.create({
        nombre:          'coordinador',
        desc:            'Coordinador academico',
        requiereEscuela: false,
      });

      expect(result.nombre).toBe('coordinador');
      expect(mockPrisma.rolUsuario.create).toHaveBeenCalledOnce();
    });

    it('debe lanzar ConflictError si el nombre ya existe', async () => {
      mockPrisma.rolUsuario.findFirst.mockResolvedValue(rolBase as any);

      await expect(
        RolService.create({ nombre: 'coordinador', requiereEscuela: false })
      ).rejects.toThrow(ConflictError);
    });

    it('debe recargar el cache al crear', async () => {
      const { cargarPermisos } = await import('../../../lib/permissions');
      mockPrisma.rolUsuario.findFirst.mockResolvedValue(null);
      mockPrisma.rolUsuario.create.mockResolvedValue(rolBase as any);

      await RolService.create({ nombre: 'coordinador', requiereEscuela: false });

      expect(cargarPermisos).toHaveBeenCalledOnce();
    });
  });

  describe('update', () => {
    it('debe actualizar el rol correctamente', async () => {
      mockPrisma.rolUsuario.findFirst
        .mockResolvedValueOnce(rolBase as any)
        .mockResolvedValueOnce(null);
      mockPrisma.rolUsuario.update.mockResolvedValue({ ...rolBase, desc: 'Nueva desc' } as any);

      const result = await RolService.update('uuid-rol', { desc: 'Nueva desc' });

      expect(result.desc).toBe('Nueva desc');
    });

    it('debe lanzar ConflictError si el nuevo nombre ya existe en otro rol', async () => {
      mockPrisma.rolUsuario.findFirst
        .mockResolvedValueOnce(rolBase as any)
        .mockResolvedValueOnce({ ...rolBase, id: 'otro-rol' } as any);

      await expect(
        RolService.update('uuid-rol', { nombre: 'supervisor' })
      ).rejects.toThrow(ConflictError);
    });

    it('debe lanzar NotFoundError si el rol no existe', async () => {
      mockPrisma.rolUsuario.findFirst.mockResolvedValue(null);

      await expect(
        RolService.update('uuid-inexistente', { desc: 'Nueva desc' })
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('softDelete', () => {
    it('debe hacer soft delete correctamente', async () => {
      mockPrisma.rolUsuario.findFirst.mockResolvedValue(rolBase as any);
      mockPrisma.rolUsuario.update.mockResolvedValue({ ...rolBase, activo: false } as any);

      await RolService.softDelete('uuid-rol');

      expect(mockPrisma.rolUsuario.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { activo: false } })
      );
    });

    it('debe lanzar NotFoundError si el rol no existe', async () => {
      mockPrisma.rolUsuario.findFirst.mockResolvedValue(null);

      await expect(
        RolService.softDelete('uuid-inexistente')
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('asignarPermisos', () => {
    it('debe reemplazar los permisos del rol correctamente', async () => {
      mockPrisma.rolUsuario.findFirst.mockResolvedValue(rolBase as any);
      mockPrisma.$transaction.mockImplementation(async (fn: any) => fn(mockPrisma));
      mockPrisma.rolPermisoUsuario.deleteMany.mockResolvedValue({ count: 1 });
      mockPrisma.rolPermisoUsuario.createMany.mockResolvedValue({ count: 2 });

      await RolService.asignarPermisos('uuid-rol', {
        idPermisos: ['uuid-permiso-1', 'uuid-permiso-2'],
      });

      expect(mockPrisma.rolPermisoUsuario.deleteMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { idRol: 'uuid-rol' } })
      );
      expect(mockPrisma.rolPermisoUsuario.createMany).toHaveBeenCalledOnce();
    });

    it('debe lanzar NotFoundError si el rol no existe', async () => {
      mockPrisma.rolUsuario.findFirst.mockResolvedValue(null);

      await expect(
        RolService.asignarPermisos('uuid-inexistente', { idPermisos: [] })
      ).rejects.toThrow(NotFoundError);
    });
  });
});
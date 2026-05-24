import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockPrisma } from '../../mocks/prisma.mock';
import { PermisoService } from '../../../modules/permiso/permiso.service';
import { NotFoundError, ConflictError } from '../../../lib/errors';
import { mockReset } from 'vitest-mock-extended';

// Evita que cargarPermisos haga queries reales en tests unitarios
vi.mock('../../../lib/permissions', () => ({
  cargarPermisos: vi.fn().mockResolvedValue(undefined),
  tienePermiso:   vi.fn().mockReturnValue(true),
}));

const permisoBase = {
  id:     'uuid-permiso',
  nombre: 'reportes:read',
  desc:   'Ver reportes',
  activo: true,
  fCre:   new Date(),
  fMod:   new Date(),
};

beforeEach(() => {
  mockReset(mockPrisma);
  vi.clearAllMocks();
});

describe('PermisoService', () => {

  describe('getAll', () => {
    it('debe retornar lista de permisos activos', async () => {
      mockPrisma.permisoUsuario.findMany.mockResolvedValue([permisoBase]);

      const result = await PermisoService.getAll();

      expect(result).toHaveLength(1);
      expect(mockPrisma.permisoUsuario.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { activo: true } })
      );
    });
  });

  describe('getById', () => {
    it('debe retornar el permiso si existe', async () => {
      mockPrisma.permisoUsuario.findFirst.mockResolvedValue(permisoBase);

      const result = await PermisoService.getById('uuid-permiso');

      expect(result.nombre).toBe('reportes:read');
    });

    it('debe lanzar NotFoundError si no existe', async () => {
      mockPrisma.permisoUsuario.findFirst.mockResolvedValue(null);

      await expect(
        PermisoService.getById('uuid-inexistente')
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('create', () => {
    it('debe crear el permiso correctamente', async () => {
      mockPrisma.permisoUsuario.findFirst.mockResolvedValue(null);
      mockPrisma.permisoUsuario.create.mockResolvedValue(permisoBase);

      const result = await PermisoService.create({ nombre: 'reportes:read', desc: 'Ver reportes' });

      expect(result.nombre).toBe('reportes:read');
      expect(mockPrisma.permisoUsuario.create).toHaveBeenCalledOnce();
    });

    it('debe lanzar ConflictError si el nombre ya existe', async () => {
      mockPrisma.permisoUsuario.findFirst.mockResolvedValue(permisoBase);

      await expect(
        PermisoService.create({ nombre: 'reportes:read' })
      ).rejects.toThrow(ConflictError);
    });

    it('debe recargar el cache al crear', async () => {
      const { cargarPermisos } = await import('../../../lib/permissions');
      mockPrisma.permisoUsuario.findFirst.mockResolvedValue(null);
      mockPrisma.permisoUsuario.create.mockResolvedValue(permisoBase);

      await PermisoService.create({ nombre: 'reportes:read' });

      expect(cargarPermisos).toHaveBeenCalledOnce();
    });
  });

  describe('update', () => {
    it('debe actualizar el permiso correctamente', async () => {
      mockPrisma.permisoUsuario.findFirst
        .mockResolvedValueOnce(permisoBase)
        .mockResolvedValueOnce(null);
      mockPrisma.permisoUsuario.update.mockResolvedValue({ ...permisoBase, desc: 'Nueva desc' });

      const result = await PermisoService.update('uuid-permiso', { desc: 'Nueva desc' });

      expect(result.desc).toBe('Nueva desc');
    });

    it('debe lanzar ConflictError si el nuevo nombre ya existe en otro permiso', async () => {
      mockPrisma.permisoUsuario.findFirst
        .mockResolvedValueOnce(permisoBase)
        .mockResolvedValueOnce({ ...permisoBase, id: 'otro-permiso' });

      await expect(
        PermisoService.update('uuid-permiso', { nombre: 'reportes:write' })
      ).rejects.toThrow(ConflictError);
    });

    it('debe lanzar NotFoundError si el permiso no existe', async () => {
      mockPrisma.permisoUsuario.findFirst.mockResolvedValue(null);

      await expect(
        PermisoService.update('uuid-inexistente', { desc: 'Nueva desc' })
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('softDelete', () => {
    it('debe hacer soft delete correctamente', async () => {
      mockPrisma.permisoUsuario.findFirst.mockResolvedValue(permisoBase);
      mockPrisma.permisoUsuario.update.mockResolvedValue({ ...permisoBase, activo: false });

      await PermisoService.softDelete('uuid-permiso');

      expect(mockPrisma.permisoUsuario.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { activo: false } })
      );
    });

    it('debe lanzar NotFoundError si el permiso no existe', async () => {
      mockPrisma.permisoUsuario.findFirst.mockResolvedValue(null);

      await expect(
        PermisoService.softDelete('uuid-inexistente')
      ).rejects.toThrow(NotFoundError);
    });
  });
});
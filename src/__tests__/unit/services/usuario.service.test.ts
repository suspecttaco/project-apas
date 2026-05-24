import { describe, it, expect, beforeEach } from 'vitest';
import { mockPrisma } from '../../mocks/prisma.mock';
import { UsuarioService } from '../../../modules/usuario/usuario.service';
import { NotFoundError, ConflictError, ValidationError } from '../../../lib/errors';
import { mockReset } from 'vitest-mock-extended';
import { UUID_ROL_ADMIN, UUID_ROL_DIRECTOR } from '../../mocks/permissions.mock';

const rolAdmin = {
  id:              UUID_ROL_ADMIN,
  nombre:          'admin',
  desc:            null,
  requiereEscuela: false,
  activo:          true,
  fCre:            new Date(),
  fMod:            new Date(),
};

const rolDirector = {
  id:              UUID_ROL_DIRECTOR,
  nombre:          'director',
  desc:            null,
  requiereEscuela: true,
  activo:          true,
  fCre:            new Date(),
  fMod:            new Date(),
};

const escuelaBase = {
  id:     'uuid-escuela',
  nombre: 'Secundaria Test',
  activo: true,
};

const usuarioBase = {
  id:     'uuid-usuario',
  idRol:  UUID_ROL_ADMIN,
  idEsc:  null,
  nombre: 'Juan Perez',
  correo: 'juan@sepyc.gob.mx',
  contra: 'hash',
  activo: true,
  fCre:   new Date(),
  fMod:   new Date(),
  rol:    rolAdmin,
  escuela: null,
};

beforeEach(() => {
  mockReset(mockPrisma);
});

describe('UsuarioService', () => {

  describe('getAll', () => {
    it('debe retornar lista de usuarios activos', async () => {
      mockPrisma.usuario.findMany.mockResolvedValue([usuarioBase] as any);

      const result = await UsuarioService.getAll();

      expect(result).toHaveLength(1);
      expect(mockPrisma.usuario.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { activo: true } })
      );
    });
  });

  describe('getById', () => {
    it('debe retornar el usuario si existe', async () => {
      mockPrisma.usuario.findFirst.mockResolvedValue(usuarioBase as any);

      const result = await UsuarioService.getById('uuid-usuario');

      expect(result.correo).toBe('juan@sepyc.gob.mx');
    });

    it('debe lanzar NotFoundError si no existe', async () => {
      mockPrisma.usuario.findFirst.mockResolvedValue(null);

      await expect(
        UsuarioService.getById('uuid-inexistente')
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('create', () => {
    it('debe crear un usuario admin correctamente', async () => {
      mockPrisma.usuario.findFirst.mockResolvedValue(null);
      mockPrisma.rolUsuario.findFirst.mockResolvedValue(rolAdmin as any);
      mockPrisma.usuario.create.mockResolvedValue(usuarioBase as any);

      const result = await UsuarioService.create({
        nombre: 'Juan Perez',
        correo: 'juan@sepyc.gob.mx',
        contra: 'contrasena123',
        idRol:  UUID_ROL_ADMIN,
      });

      expect(result.correo).toBe('juan@sepyc.gob.mx');
      expect(mockPrisma.usuario.create).toHaveBeenCalledOnce();
    });

    it('debe crear un usuario director con escuela correctamente', async () => {
      const usuarioDirector = { ...usuarioBase, idRol: UUID_ROL_DIRECTOR, idEsc: 'uuid-escuela', rol: rolDirector };

      mockPrisma.usuario.findFirst.mockResolvedValue(null);
      mockPrisma.rolUsuario.findFirst.mockResolvedValue(rolDirector as any);
      mockPrisma.escuela.findFirst.mockResolvedValue(escuelaBase as any);
      mockPrisma.usuario.create.mockResolvedValue(usuarioDirector as any);

      const result = await UsuarioService.create({
        nombre: 'Juan Perez',
        correo: 'juan@sepyc.gob.mx',
        contra: 'contrasena123',
        idRol:  UUID_ROL_DIRECTOR,
        idEsc:  'uuid-escuela',
      });

      expect(result.idEsc).toBe('uuid-escuela');
    });

    it('debe lanzar ConflictError si el correo ya esta registrado', async () => {
      mockPrisma.usuario.findFirst.mockResolvedValue(usuarioBase as any);

      await expect(
        UsuarioService.create({
          nombre: 'Otro',
          correo: 'juan@sepyc.gob.mx',
          contra: 'contrasena123',
          idRol:  UUID_ROL_ADMIN,
        })
      ).rejects.toThrow(ConflictError);
    });

    it('debe lanzar NotFoundError si el rol no existe', async () => {
      mockPrisma.usuario.findFirst.mockResolvedValue(null);
      mockPrisma.rolUsuario.findFirst.mockResolvedValue(null);

      await expect(
        UsuarioService.create({
          nombre: 'Juan',
          correo: 'juan@sepyc.gob.mx',
          contra: 'contrasena123',
          idRol:  'uuid-rol-inexistente',
        })
      ).rejects.toThrow(NotFoundError);
    });

    it('debe lanzar ValidationError si el rol requiere escuela y no viene idEsc', async () => {
      mockPrisma.usuario.findFirst.mockResolvedValue(null);
      mockPrisma.rolUsuario.findFirst.mockResolvedValue(rolDirector as any);

      await expect(
        UsuarioService.create({
          nombre: 'Juan',
          correo: 'juan@sepyc.gob.mx',
          contra: 'contrasena123',
          idRol:  UUID_ROL_DIRECTOR,
          // sin idEsc
        })
      ).rejects.toThrow(ValidationError);
    });

    it('debe lanzar NotFoundError si la escuela no existe', async () => {
      mockPrisma.usuario.findFirst.mockResolvedValue(null);
      mockPrisma.rolUsuario.findFirst.mockResolvedValue(rolDirector as any);
      mockPrisma.escuela.findFirst.mockResolvedValue(null);

      await expect(
        UsuarioService.create({
          nombre: 'Juan',
          correo: 'juan@sepyc.gob.mx',
          contra: 'contrasena123',
          idRol:  UUID_ROL_DIRECTOR,
          idEsc:  'uuid-escuela-inexistente',
        })
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('update', () => {
    it('debe actualizar el usuario correctamente', async () => {
      mockPrisma.usuario.findFirst.mockResolvedValue(usuarioBase as any);
      mockPrisma.usuario.update.mockResolvedValue({ ...usuarioBase, nombre: 'Nuevo Nombre' } as any);

      const result = await UsuarioService.update('uuid-usuario', { nombre: 'Nuevo Nombre' });

      expect(result.nombre).toBe('Nuevo Nombre');
    });

    it('debe lanzar ConflictError si el nuevo correo ya esta registrado', async () => {
      mockPrisma.usuario.findFirst
        .mockResolvedValueOnce(usuarioBase as any)
        .mockResolvedValueOnce({ ...usuarioBase, id: 'otro-usuario' } as any);

      await expect(
        UsuarioService.update('uuid-usuario', { correo: 'otro@sepyc.gob.mx' })
      ).rejects.toThrow(ConflictError);
    });

    it('debe lanzar ValidationError si el nuevo rol requiere escuela y no hay idEsc', async () => {
      mockPrisma.usuario.findFirst.mockResolvedValue(usuarioBase as any);
      mockPrisma.rolUsuario.findFirst.mockResolvedValue(rolDirector as any);

      await expect(
        UsuarioService.update('uuid-usuario', { idRol: UUID_ROL_DIRECTOR })
        // usuarioBase no tiene idEsc
      ).rejects.toThrow(ValidationError);
    });

    it('debe lanzar NotFoundError si el usuario no existe', async () => {
      mockPrisma.usuario.findFirst.mockResolvedValue(null);

      await expect(
        UsuarioService.update('uuid-inexistente', { nombre: 'Nuevo' })
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('softDelete', () => {
    it('debe hacer soft delete correctamente', async () => {
      mockPrisma.usuario.findFirst.mockResolvedValue(usuarioBase as any);
      mockPrisma.usuario.update.mockResolvedValue({ ...usuarioBase, activo: false } as any);

      await UsuarioService.softDelete('uuid-usuario');

      expect(mockPrisma.usuario.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { activo: false } })
      );
    });

    it('debe lanzar NotFoundError si el usuario no existe', async () => {
      mockPrisma.usuario.findFirst.mockResolvedValue(null);

      await expect(
        UsuarioService.softDelete('uuid-inexistente')
      ).rejects.toThrow(NotFoundError);
    });
  });
});
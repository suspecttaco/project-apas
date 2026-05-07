import { describe, it, expect, beforeEach } from 'vitest';
import { mockPrisma } from '../../mocks/prisma.mock';
import { AuthService } from '../../../modules/auth/auth.service';
import { UnauthorizedError } from '../../../lib/errors';
import bcrypt from 'bcrypt';
import { mockReset } from 'vitest-mock-extended';

beforeEach(() => {
  mockReset(mockPrisma);
});

describe('AuthService', () => {

  describe('loginSupervisor', () => {

    it('debe retornar un token JWT valido con credenciales correctas', async () => {
      const hash = await bcrypt.hash('admin123', 12);
      mockPrisma.usuarioSupervisor.findFirst.mockResolvedValue({
        id:     'uuid-admin',
        nombre: 'Administrador',
        correo: 'admin@sepyc.gob.mx',
        contra: hash,
        rol:    'admin',
        activo: true,
        fCre:   new Date(),
        fMod:   new Date(),
      });

      const token = await AuthService.loginSupervisor({
        correo: 'admin@sepyc.gob.mx',
        contra: 'admin123',
      });

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('debe lanzar UnauthorizedError si el usuario no existe', async () => {
      mockPrisma.usuarioSupervisor.findFirst.mockResolvedValue(null);

      await expect(
        AuthService.loginSupervisor({ correo: 'noexiste@test.com', contra: '123456' })
      ).rejects.toThrow(UnauthorizedError);
    });

    it('debe lanzar UnauthorizedError si la contrasena es incorrecta', async () => {
      const hash = await bcrypt.hash('correcta', 12);
      mockPrisma.usuarioSupervisor.findFirst.mockResolvedValue({
        id:     'uuid-admin',
        nombre: 'Administrador',
        correo: 'admin@sepyc.gob.mx',
        contra: hash,
        rol:    'admin',
        activo: true,
        fCre:   new Date(),
        fMod:   new Date(),
      });

      await expect(
        AuthService.loginSupervisor({ correo: 'admin@sepyc.gob.mx', contra: 'incorrecta' })
      ).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('loginDirector', () => {

    it('debe retornar un token JWT con idEsc incluido', async () => {
      const hash = await bcrypt.hash('director123', 12);
      mockPrisma.usuarioDirector.findFirst.mockResolvedValue({
        id:     'uuid-director',
        idEsc:  'uuid-escuela',
        nombre: 'Director',
        correo: 'director@escuela.mx',
        contra: hash,
        activo: true,
        fCre:   new Date(),
        fMod:   new Date(),
      });

      const token = await AuthService.loginDirector({
        correo: 'director@escuela.mx',
        contra: 'director123',
      });

      expect(token).toBeDefined();
      expect(token.split('.')).toHaveLength(3);

      const payload = JSON.parse(
        Buffer.from(token.split('.')[1], 'base64').toString()
      );
      expect(payload.idEsc).toBe('uuid-escuela');
      expect(payload.rol).toBe('director');
    });

    it('debe lanzar UnauthorizedError si el director no existe', async () => {
      mockPrisma.usuarioDirector.findFirst.mockResolvedValue(null);

      await expect(
        AuthService.loginDirector({ correo: 'noexiste@test.com', contra: '123456' })
      ).rejects.toThrow(UnauthorizedError);
    });
  });
});
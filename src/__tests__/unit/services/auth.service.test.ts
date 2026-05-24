import { describe, it, expect, beforeEach } from 'vitest';
import { mockPrisma } from '../../mocks/prisma.mock';
import { AuthService } from '../../../modules/auth/auth.service';
import { UnauthorizedError } from '../../../lib/errors';
import { UUID_ROL_ADMIN, UUID_ROL_DIRECTOR } from '../../mocks/permissions.mock';
import bcrypt from 'bcrypt';
import { mockReset } from 'vitest-mock-extended';

beforeEach(() => {
  mockReset(mockPrisma);
});

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

describe('AuthService.login', () => {

  it('debe retornar un token JWT valido para admin', async () => {
    const hash = await bcrypt.hash('admin123', 12);

    mockPrisma.usuario.findFirst.mockResolvedValue({
      id:     'uuid-admin',
      idRol:  UUID_ROL_ADMIN,
      idEsc:  null,
      nombre: 'Administrador',
      correo: 'admin@sepyc.gob.mx',
      contra: hash,
      activo: true,
      fCre:   new Date(),
      fMod:   new Date(),
      rol:    rolAdmin,
    } as any);

    const token = await AuthService.login({
      correo: 'admin@sepyc.gob.mx',
      contra: 'admin123',
    });

    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);

    // Verifica que el payload tenga idRol
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    expect(payload.idRol).toBe(UUID_ROL_ADMIN);
    expect(payload.idEsc).toBeUndefined();
  });

  it('debe retornar un token JWT con idEsc para director', async () => {
    const hash = await bcrypt.hash('director123', 12);

    mockPrisma.usuario.findFirst.mockResolvedValue({
      id:     'uuid-director',
      idRol:  UUID_ROL_DIRECTOR,
      idEsc:  'uuid-escuela',
      nombre: 'Director',
      correo: 'director@escuela.mx',
      contra: hash,
      activo: true,
      fCre:   new Date(),
      fMod:   new Date(),
      rol:    rolDirector,
    } as any);

    const token = await AuthService.login({
      correo: 'director@escuela.mx',
      contra: 'director123',
    });

    expect(token).toBeDefined();
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    expect(payload.idRol).toBe(UUID_ROL_DIRECTOR);
    expect(payload.idEsc).toBe('uuid-escuela');
  });

  it('debe lanzar UnauthorizedError si el director no tiene escuela asignada', async () => {
    const hash = await bcrypt.hash('director123', 12);

    mockPrisma.usuario.findFirst.mockResolvedValue({
      id:     'uuid-director',
      idRol:  UUID_ROL_DIRECTOR,
      idEsc:  null,
      nombre: 'Director',
      correo: 'director@escuela.mx',
      contra: hash,
      activo: true,
      fCre:   new Date(),
      fMod:   new Date(),
      rol:    rolDirector,
    } as any);

    await expect(
      AuthService.login({ correo: 'director@escuela.mx', contra: 'director123' })
    ).rejects.toThrow(UnauthorizedError);
  });

  it('debe lanzar UnauthorizedError si el usuario no existe', async () => {
    mockPrisma.usuario.findFirst.mockResolvedValue(null);

    await expect(
      AuthService.login({ correo: 'noexiste@test.com', contra: '123456' })
    ).rejects.toThrow(UnauthorizedError);
  });

  it('debe lanzar UnauthorizedError si la contrasena es incorrecta', async () => {
    const hash = await bcrypt.hash('correcta', 12);

    mockPrisma.usuario.findFirst.mockResolvedValue({
      id:     'uuid-admin',
      idRol:  UUID_ROL_ADMIN,
      idEsc:  null,
      nombre: 'Administrador',
      correo: 'admin@sepyc.gob.mx',
      contra: hash,
      activo: true,
      fCre:   new Date(),
      fMod:   new Date(),
      rol:    rolAdmin,
    } as any);

    await expect(
      AuthService.login({ correo: 'admin@sepyc.gob.mx', contra: 'incorrecta' })
    ).rejects.toThrow(UnauthorizedError);
  });
});
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app';
import { mockPrisma } from '../mocks/prisma.mock';
import { mockReset } from 'vitest-mock-extended';
import { UUID_ROL_ADMIN, UUID_ROL_DIRECTOR } from '../mocks/permissions.mock';
import bcrypt from 'bcrypt';

beforeEach(() => {
  mockReset(mockPrisma);
});

describe('POST /api/auth/login', () => {

  it('debe retornar 200 y token con credenciales de admin correctas', async () => {
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
      rol: {
        id:              UUID_ROL_ADMIN,
        nombre:          'admin',
        desc:            null,
        requiereEscuela: false,
        activo:          true,
        fCre:            new Date(),
        fMod:            new Date(),
      },
    } as any);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ correo: 'admin@sepyc.gob.mx', contra: 'admin123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.token.split('.')).toHaveLength(3);
  });

  it('debe retornar 200 y token con credenciales de director correctas', async () => {
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
      rol: {
        id:              UUID_ROL_DIRECTOR,
        nombre:          'director',
        desc:            null,
        requiereEscuela: true,
        activo:          true,
        fCre:            new Date(),
        fMod:            new Date(),
      },
    } as any);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ correo: 'director@escuela.mx', contra: 'director123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('debe retornar 401 si el director no tiene escuela asignada', async () => {
    const hash = await bcrypt.hash('director123', 12);

    mockPrisma.usuario.findFirst.mockResolvedValue({
      id:     'uuid-director',
      idRol:  UUID_ROL_DIRECTOR,
      idEsc:  null, // sin escuela
      nombre: 'Director',
      correo: 'director@escuela.mx',
      contra: hash,
      activo: true,
      fCre:   new Date(),
      fMod:   new Date(),
      rol: {
        id:              UUID_ROL_DIRECTOR,
        nombre:          'director',
        desc:            null,
        requiereEscuela: true,
        activo:          true,
        fCre:            new Date(),
        fMod:            new Date(),
      },
    } as any);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ correo: 'director@escuela.mx', contra: 'director123' });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('No tienes una escuela asignada');
  });

  it('debe retornar 401 con credenciales incorrectas', async () => {
    mockPrisma.usuario.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ correo: 'noexiste@test.com', contra: '123456' });

    expect(res.status).toBe(401);
  });

  it('debe retornar 400 si el body es invalido', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ correo: 'no-es-email', contra: '123' });

    expect(res.status).toBe(400);
  });

  it('debe retornar 400 si faltan campos requeridos', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ correo: 'director@escuela.mx' });

    expect(res.status).toBe(400);
  });
});
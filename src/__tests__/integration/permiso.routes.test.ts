import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app';
import { mockPrisma } from '../mocks/prisma.mock';
import { mockReset } from 'vitest-mock-extended';
import { tokenAdmin, tokenDirector } from './setup';

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
});

describe('GET /api/permisos', () => {

  it('debe retornar 200 con lista de permisos para admin', async () => {
    mockPrisma.permisoUsuario.findMany.mockResolvedValue([permisoBase]);

    const res = await request(app)
      .get('/api/permisos')
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it('debe retornar 403 para director', async () => {
    const res = await request(app)
      .get('/api/permisos')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(403);
  });

  it('debe retornar 401 sin token', async () => {
    const res = await request(app).get('/api/permisos');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/permisos/:id', () => {

  it('debe retornar 200 con el permiso encontrado', async () => {
    mockPrisma.permisoUsuario.findFirst.mockResolvedValue(permisoBase);

    const res = await request(app)
      .get('/api/permisos/uuid-permiso')
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(200);
    expect(res.body.nombre).toBe('reportes:read');
  });

  it('debe retornar 404 si no existe', async () => {
    mockPrisma.permisoUsuario.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .get('/api/permisos/uuid-inexistente')
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(404);
  });
});
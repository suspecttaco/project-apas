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

describe('POST /api/permisos', () => {

  it('debe retornar 201 al crear permiso correctamente', async () => {
    mockPrisma.permisoUsuario.findFirst.mockResolvedValue(null);
    mockPrisma.permisoUsuario.create.mockResolvedValue(permisoBase);

    const res = await request(app)
      .post('/api/permisos')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ nombre: 'reportes:read', desc: 'Ver reportes' });

    expect(res.status).toBe(201);
    expect(res.body.nombre).toBe('reportes:read');
  });

  it('debe retornar 409 si el nombre ya existe', async () => {
    mockPrisma.permisoUsuario.findFirst.mockResolvedValue(permisoBase);

    const res = await request(app)
      .post('/api/permisos')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ nombre: 'reportes:read' });

    expect(res.status).toBe(409);
  });

  it('debe retornar 400 si el formato del nombre es invalido', async () => {
    const res = await request(app)
      .post('/api/permisos')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ nombre: 'formato-invalido' });

    expect(res.status).toBe(400);
  });

  it('debe retornar 403 para director', async () => {
    const res = await request(app)
      .post('/api/permisos')
      .set('Authorization', `Bearer ${tokenDirector()}`)
      .send({ nombre: 'reportes:read' });

    expect(res.status).toBe(403);
  });
});

describe('PUT /api/permisos/:id', () => {

  it('debe retornar 200 al actualizar correctamente', async () => {
    mockPrisma.permisoUsuario.findFirst
      .mockResolvedValueOnce(permisoBase)
      .mockResolvedValueOnce(null);
    mockPrisma.permisoUsuario.update.mockResolvedValue({ ...permisoBase, desc: 'Nueva desc' });

    const res = await request(app)
      .put('/api/permisos/uuid-permiso')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ desc: 'Nueva desc' });

    expect(res.status).toBe(200);
    expect(res.body.desc).toBe('Nueva desc');
  });

  it('debe retornar 404 si no existe', async () => {
    mockPrisma.permisoUsuario.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/permisos/uuid-inexistente')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ desc: 'Nueva desc' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/permisos/:id', () => {

  it('debe retornar 204 al eliminar correctamente', async () => {
    mockPrisma.permisoUsuario.findFirst.mockResolvedValue(permisoBase);
    mockPrisma.permisoUsuario.update.mockResolvedValue({ ...permisoBase, activo: false });

    const res = await request(app)
      .delete('/api/permisos/uuid-permiso')
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(204);
  });

  it('debe retornar 404 si no existe', async () => {
    mockPrisma.permisoUsuario.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .delete('/api/permisos/uuid-inexistente')
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(404);
  });
});
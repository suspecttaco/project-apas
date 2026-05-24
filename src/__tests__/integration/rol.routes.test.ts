import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app';
import { mockPrisma } from '../mocks/prisma.mock';
import { mockReset } from 'vitest-mock-extended';
import { tokenAdmin, tokenDirector } from './setup';
import { UUID_ROL_ADMIN } from '../mocks/permissions.mock';

const rolBase = {
  id:              'uuid-rol-nuevo',
  nombre:          'coordinador',
  desc:            'Coordinador academico',
  requiereEscuela: false,
  activo:          true,
  fCre:            new Date(),
  fMod:            new Date(),
  permisos:        [],
};

beforeEach(() => {
  mockReset(mockPrisma);
});

describe('GET /api/roles', () => {

  it('debe retornar 200 con lista de roles para admin', async () => {
    mockPrisma.rolUsuario.findMany.mockResolvedValue([rolBase] as any);

    const res = await request(app)
      .get('/api/roles')
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it('debe retornar 403 para director', async () => {
    const res = await request(app)
      .get('/api/roles')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(403);
  });

  it('debe retornar 401 sin token', async () => {
    const res = await request(app).get('/api/roles');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/roles/:id', () => {

  it('debe retornar 200 con el rol encontrado', async () => {
    mockPrisma.rolUsuario.findFirst.mockResolvedValue(rolBase as any);

    const res = await request(app)
      .get('/api/roles/uuid-rol-nuevo')
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(200);
    expect(res.body.nombre).toBe('coordinador');
  });

  it('debe retornar 404 si no existe', async () => {
    mockPrisma.rolUsuario.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .get('/api/roles/uuid-inexistente')
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(404);
  });
});

describe('POST /api/roles', () => {

  it('debe retornar 201 al crear rol correctamente', async () => {
    mockPrisma.rolUsuario.findFirst.mockResolvedValue(null);
    mockPrisma.rolUsuario.create.mockResolvedValue(rolBase as any);

    const res = await request(app)
      .post('/api/roles')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ nombre: 'coordinador', desc: 'Coordinador academico', requiereEscuela: false });

    expect(res.status).toBe(201);
    expect(res.body.nombre).toBe('coordinador');
  });

  it('debe retornar 409 si el nombre ya existe', async () => {
    mockPrisma.rolUsuario.findFirst.mockResolvedValue(rolBase as any);

    const res = await request(app)
      .post('/api/roles')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ nombre: 'coordinador', requiereEscuela: false });

    expect(res.status).toBe(409);
  });

  it('debe retornar 400 si faltan campos requeridos', async () => {
    const res = await request(app)
      .post('/api/roles')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ nombre: 'coordinador' }); // falta requiereEscuela

    expect(res.status).toBe(400);
  });

  it('debe retornar 403 para director', async () => {
    const res = await request(app)
      .post('/api/roles')
      .set('Authorization', `Bearer ${tokenDirector()}`)
      .send({ nombre: 'coordinador', requiereEscuela: false });

    expect(res.status).toBe(403);
  });
});

describe('PUT /api/roles/:id', () => {

  it('debe retornar 200 al actualizar correctamente', async () => {
    mockPrisma.rolUsuario.findFirst
      .mockResolvedValueOnce(rolBase as any)
      .mockResolvedValueOnce(null);
    mockPrisma.rolUsuario.update.mockResolvedValue({ ...rolBase, desc: 'Nueva desc' } as any);

    const res = await request(app)
      .put('/api/roles/uuid-rol-nuevo')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ desc: 'Nueva desc' });

    expect(res.status).toBe(200);
    expect(res.body.desc).toBe('Nueva desc');
  });

  it('debe retornar 404 si no existe', async () => {
    mockPrisma.rolUsuario.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/roles/uuid-inexistente')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ desc: 'Nueva desc' });

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/roles/:id/permisos', () => {

  it('debe retornar 200 al asignar permisos correctamente', async () => {
    mockPrisma.rolUsuario.findFirst.mockResolvedValue(rolBase as any);
    mockPrisma.$transaction.mockImplementation(async (fn: any) => fn(mockPrisma));
    mockPrisma.rolPermisoUsuario.deleteMany.mockResolvedValue({ count: 0 });
    mockPrisma.rolPermisoUsuario.createMany.mockResolvedValue({ count: 1 });

    const res = await request(app)
      .put('/api/roles/uuid-rol-nuevo/permisos')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ idPermisos: [UUID_ROL_ADMIN] });

    expect(res.status).toBe(200);
  });

  it('debe retornar 404 si el rol no existe', async () => {
    mockPrisma.rolUsuario.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/roles/uuid-inexistente/permisos')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ idPermisos: [] });

    expect(res.status).toBe(404);
  });

  it('debe retornar 400 si idPermisos no es un array', async () => {
    const res = await request(app)
      .put('/api/roles/uuid-rol-nuevo/permisos')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ idPermisos: 'no-es-array' });

    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/roles/:id', () => {

  it('debe retornar 204 al eliminar correctamente', async () => {
    mockPrisma.rolUsuario.findFirst.mockResolvedValue(rolBase as any);
    mockPrisma.rolUsuario.update.mockResolvedValue({ ...rolBase, activo: false } as any);

    const res = await request(app)
      .delete('/api/roles/uuid-rol-nuevo')
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(204);
  });

  it('debe retornar 404 si no existe', async () => {
    mockPrisma.rolUsuario.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .delete('/api/roles/uuid-inexistente')
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(404);
  });
});

describe('POST /api/roles/recargar', () => {

  it('debe retornar 200 al recargar el cache', async () => {
    const res = await request(app)
      .post('/api/roles/recargar')
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBeDefined();
  });

  it('debe retornar 403 para director', async () => {
    const res = await request(app)
      .post('/api/roles/recargar')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(403);
  });
});
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app';
import { mockPrisma } from '../mocks/prisma.mock';
import { mockReset } from 'vitest-mock-extended';
import { tokenAdmin, tokenDirector, UUID_ESC } from './setup';

const UUID_PLAN = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

const cicloBase = {
  id:      'uuid-ciclo',
  idPlan:  UUID_PLAN,
  idEsc:   UUID_ESC,
  nombre:  '2024-2025',
  fInicio: new Date('2024-08-26'),
  fFin:    new Date('2025-07-11'),
  activo:  false,
  fCre:    new Date(),
  fMod:    new Date(),
};

beforeEach(() => {
  mockReset(mockPrisma);
});

describe('GET /api/ciclos', () => {

  it('debe retornar 200 con lista de ciclos', async () => {
    mockPrisma.ciclo.findMany.mockResolvedValue([cicloBase]);

    const res = await request(app)
      .get('/api/ciclos')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it('debe retornar 401 sin token', async () => {
    const res = await request(app).get('/api/ciclos');
    expect(res.status).toBe(401);
  });

  it('debe retornar 403 para admin sin idEsc', async () => {
    const res = await request(app)
      .get('/api/ciclos')
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(403);
  });
});

describe('GET /api/ciclos/:id', () => {

  it('debe retornar 200 con el ciclo encontrado', async () => {
    mockPrisma.ciclo.findFirst.mockResolvedValue(cicloBase);

    const res = await request(app)
      .get('/api/ciclos/uuid-ciclo')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(200);
    expect(res.body.nombre).toBe('2024-2025');
  });

  it('debe retornar 404 si el ciclo no existe', async () => {
    mockPrisma.ciclo.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .get('/api/ciclos/uuid-inexistente')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(404);
  });
});

describe('POST /api/ciclos', () => {

  it('debe retornar 201 al crear ciclo correctamente', async () => {
    mockPrisma.ciclo.findFirst.mockResolvedValue(null);
    mockPrisma.ciclo.create.mockResolvedValue(cicloBase);

    const res = await request(app)
      .post('/api/ciclos')
      .set('Authorization', `Bearer ${tokenDirector()}`)
      .send({
        idPlan:  UUID_PLAN,
        nombre:  '2024-2025',
        fInicio: '2024-08-26',
        fFin:    '2025-07-11',
      });

    expect(res.status).toBe(201);
  });

  it('debe retornar 409 si el nombre ya existe', async () => {
    mockPrisma.ciclo.findFirst.mockResolvedValue(cicloBase);

    const res = await request(app)
      .post('/api/ciclos')
      .set('Authorization', `Bearer ${tokenDirector()}`)
      .send({
        idPlan:  UUID_PLAN,
        nombre:  '2024-2025',
        fInicio: '2024-08-26',
        fFin:    '2025-07-11',
      });

    expect(res.status).toBe(409);
  });

  it('debe retornar 400 si faltan campos requeridos', async () => {
    const res = await request(app)
      .post('/api/ciclos')
      .set('Authorization', `Bearer ${tokenDirector()}`)
      .send({ nombre: '2024-2025' });

    expect(res.status).toBe(400);
  });
});

describe('PUT /api/ciclos/:id', () => {

  it('debe retornar 200 al actualizar correctamente', async () => {
    mockPrisma.ciclo.findFirst
      .mockResolvedValueOnce(cicloBase)
      .mockResolvedValueOnce(null);
    mockPrisma.ciclo.update.mockResolvedValue({ ...cicloBase, nombre: '2025-2026' });

    const res = await request(app)
      .put('/api/ciclos/uuid-ciclo')
      .set('Authorization', `Bearer ${tokenDirector()}`)
      .send({ nombre: '2025-2026' });

    expect(res.status).toBe(200);
    expect(res.body.nombre).toBe('2025-2026');
  });

  it('debe retornar 404 si el ciclo no existe', async () => {
    mockPrisma.ciclo.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/ciclos/uuid-inexistente')
      .set('Authorization', `Bearer ${tokenDirector()}`)
      .send({ nombre: '2025-2026' });

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/ciclos/:id/activar', () => {

  it('debe retornar 200 al activar el ciclo', async () => {
    mockPrisma.ciclo.findFirst.mockResolvedValue(cicloBase);
    mockPrisma.ciclo.updateMany.mockResolvedValue({ count: 0 });
    mockPrisma.ciclo.update.mockResolvedValue({ ...cicloBase, activo: true });

    const res = await request(app)
      .put('/api/ciclos/uuid-ciclo/activar')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(200);
    expect(res.body.activo).toBe(true);
  });

  it('debe retornar 404 si el ciclo no existe', async () => {
    mockPrisma.ciclo.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/ciclos/uuid-inexistente/activar')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/ciclos/:id', () => {

  it('debe retornar 204 al eliminar ciclo inactivo', async () => {
    mockPrisma.ciclo.findFirst.mockResolvedValue({ ...cicloBase, activo: false });
    mockPrisma.ciclo.update.mockResolvedValue({ ...cicloBase, activo: false });

    const res = await request(app)
      .delete('/api/ciclos/uuid-ciclo')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(204);
  });

  it('debe retornar 409 al intentar eliminar el ciclo activo', async () => {
    mockPrisma.ciclo.findFirst.mockResolvedValue({ ...cicloBase, activo: true });

    const res = await request(app)
      .delete('/api/ciclos/uuid-ciclo')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(409);
  });
});
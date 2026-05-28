import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app';
import { mockPrisma } from '../mocks/prisma.mock';
import { mockReset } from 'vitest-mock-extended';
import { tokenAdmin, tokenDirector, tokenSupervisor, UUID_ESC } from './setup';

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

  it('director: usa idEsc del token', async () => {
    mockPrisma.ciclo.findMany.mockResolvedValue([cicloBase]);

    const res = await request(app)
      .get('/api/ciclos')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it('admin: usa idEsc del query param', async () => {
    mockPrisma.ciclo.findMany.mockResolvedValue([cicloBase]);

    const res = await request(app)
      .get(`/api/ciclos?idEsc=${UUID_ESC}`)
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(200);
    expect(mockPrisma.ciclo.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ idEsc: UUID_ESC }) })
    );
  });

  it('supervisor: usa idEsc del query param', async () => {
    mockPrisma.ciclo.findMany.mockResolvedValue([cicloBase]);

    const res = await request(app)
      .get(`/api/ciclos?idEsc=${UUID_ESC}`)
      .set('Authorization', `Bearer ${tokenSupervisor()}`);

    expect(res.status).toBe(200);
  });

  it('admin sin idEsc retorna 400', async () => {
    const res = await request(app)
      .get('/api/ciclos')
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(400);
  });

  it('supervisor sin idEsc retorna 400', async () => {
    const res = await request(app)
      .get('/api/ciclos')
      .set('Authorization', `Bearer ${tokenSupervisor()}`);

    expect(res.status).toBe(400);
  });

  it('retorna 401 sin token', async () => {
    const res = await request(app).get('/api/ciclos');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/ciclos/:id', () => {

  it('director: retorna el ciclo', async () => {
    mockPrisma.ciclo.findFirst.mockResolvedValue(cicloBase);

    const res = await request(app)
      .get('/api/ciclos/uuid-ciclo')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(200);
    expect(res.body.nombre).toBe('2024-2025');
  });

  it('admin con idEsc: retorna el ciclo', async () => {
    mockPrisma.ciclo.findFirst.mockResolvedValue(cicloBase);

    const res = await request(app)
      .get(`/api/ciclos/uuid-ciclo?idEsc=${UUID_ESC}`)
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(200);
  });

  it('retorna 404 si el ciclo no existe', async () => {
    mockPrisma.ciclo.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .get('/api/ciclos/uuid-inexistente')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(404);
  });
});

describe('POST /api/ciclos', () => {

  it('director: crea ciclo correctamente', async () => {
    mockPrisma.ciclo.findFirst.mockResolvedValue(null);
    mockPrisma.ciclo.create.mockResolvedValue(cicloBase);

    const res = await request(app)
      .post('/api/ciclos')
      .set('Authorization', `Bearer ${tokenDirector()}`)
      .send({ idPlan: UUID_PLAN, nombre: '2024-2025', fInicio: '2024-08-26', fFin: '2025-07-11' });

    expect(res.status).toBe(201);
  });

  it('admin con idEsc en body: crea ciclo correctamente', async () => {
    mockPrisma.ciclo.findFirst.mockResolvedValue(null);
    mockPrisma.ciclo.create.mockResolvedValue(cicloBase);

    const res = await request(app)
      .post('/api/ciclos')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ idEsc: UUID_ESC, idPlan: UUID_PLAN, nombre: '2024-2025', fInicio: '2024-08-26', fFin: '2025-07-11' });

    expect(res.status).toBe(201);
  });

  it('admin sin idEsc retorna 400', async () => {
    const res = await request(app)
      .post('/api/ciclos')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ idPlan: UUID_PLAN, nombre: '2024-2025', fInicio: '2024-08-26', fFin: '2025-07-11' });

    expect(res.status).toBe(400);
  });

  it('retorna 409 si el nombre ya existe', async () => {
    mockPrisma.ciclo.findFirst.mockResolvedValue(cicloBase);

    const res = await request(app)
      .post('/api/ciclos')
      .set('Authorization', `Bearer ${tokenDirector()}`)
      .send({ idPlan: UUID_PLAN, nombre: '2024-2025', fInicio: '2024-08-26', fFin: '2025-07-11' });

    expect(res.status).toBe(409);
  });

  it('retorna 400 si faltan campos requeridos', async () => {
    const res = await request(app)
      .post('/api/ciclos')
      .set('Authorization', `Bearer ${tokenDirector()}`)
      .send({ nombre: '2024-2025' });

    expect(res.status).toBe(400);
  });
});

describe('PUT /api/ciclos/:id', () => {

  it('actualiza correctamente', async () => {
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

  it('retorna 404 si no existe', async () => {
    mockPrisma.ciclo.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/ciclos/uuid-inexistente')
      .set('Authorization', `Bearer ${tokenDirector()}`)
      .send({ nombre: '2025-2026' });

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/ciclos/:id/activar', () => {

  it('activa el ciclo', async () => {
    mockPrisma.ciclo.findFirst.mockResolvedValue(cicloBase);
    mockPrisma.ciclo.updateMany.mockResolvedValue({ count: 0 });
    mockPrisma.ciclo.update.mockResolvedValue({ ...cicloBase, activo: true });

    const res = await request(app)
      .put('/api/ciclos/uuid-ciclo/activar')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(200);
    expect(res.body.activo).toBe(true);
  });
});

describe('DELETE /api/ciclos/:id', () => {

  it('elimina ciclo inactivo', async () => {
    mockPrisma.ciclo.findFirst.mockResolvedValue({ ...cicloBase, activo: false });
    mockPrisma.ciclo.update.mockResolvedValue({ ...cicloBase, activo: false });

    const res = await request(app)
      .delete('/api/ciclos/uuid-ciclo')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(204);
  });

  it('retorna 409 al intentar eliminar el ciclo activo', async () => {
    mockPrisma.ciclo.findFirst.mockResolvedValue({ ...cicloBase, activo: true });

    const res = await request(app)
      .delete('/api/ciclos/uuid-ciclo')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(409);
  });
});
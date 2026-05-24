import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app';
import { mockPrisma } from '../mocks/prisma.mock';
import { mockReset } from 'vitest-mock-extended';
import { tokenAdmin, tokenDirector, UUID_ESC } from './setup';

const turnoBase = {
  id:      'uuid-turno',
  idEsc:   UUID_ESC,
  nombre:  'Matutino',
  desc:    null,
  hInicio: '07:00',
  hFin:    '13:00',
  activo:  true,
  fCre:    new Date(),
  fMod:    new Date(),
};

beforeEach(() => {
  mockReset(mockPrisma);
});

describe('GET /api/turnos', () => {

  it('debe retornar 200 con lista de turnos', async () => {
    mockPrisma.turno.findMany.mockResolvedValue([turnoBase]);

    const res = await request(app)
      .get('/api/turnos')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it('debe retornar 401 sin token', async () => {
    const res = await request(app).get('/api/turnos');
    expect(res.status).toBe(401);
  });

  it('debe retornar 403 para admin sin idEsc', async () => {
    const res = await request(app)
      .get('/api/turnos')
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(403);
  });
});

describe('GET /api/turnos/:id', () => {

  it('debe retornar 200 con el turno encontrado', async () => {
    mockPrisma.turno.findFirst.mockResolvedValue(turnoBase);

    const res = await request(app)
      .get('/api/turnos/uuid-turno')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(200);
    expect(res.body.nombre).toBe('Matutino');
  });

  it('debe retornar 404 si el turno no existe', async () => {
    mockPrisma.turno.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .get('/api/turnos/uuid-inexistente')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(404);
  });
});

describe('POST /api/turnos', () => {

  it('debe retornar 201 al crear turno correctamente', async () => {
    mockPrisma.turno.findFirst.mockResolvedValue(null);
    mockPrisma.turno.create.mockResolvedValue(turnoBase);

    const res = await request(app)
      .post('/api/turnos')
      .set('Authorization', `Bearer ${tokenDirector()}`)
      .send({ nombre: 'Matutino', hInicio: '07:00', hFin: '13:00' });

    expect(res.status).toBe(201);
    expect(res.body.nombre).toBe('Matutino');
  });

  it('debe retornar 409 si el nombre ya existe', async () => {
    mockPrisma.turno.findFirst.mockResolvedValue(turnoBase);

    const res = await request(app)
      .post('/api/turnos')
      .set('Authorization', `Bearer ${tokenDirector()}`)
      .send({ nombre: 'Matutino', hInicio: '07:00', hFin: '13:00' });

    expect(res.status).toBe(409);
  });

  it('debe retornar 400 si faltan campos requeridos', async () => {
    const res = await request(app)
      .post('/api/turnos')
      .set('Authorization', `Bearer ${tokenDirector()}`)
      .send({ nombre: 'Matutino' });

    expect(res.status).toBe(400);
  });
});

describe('PUT /api/turnos/:id', () => {

  it('debe retornar 200 al actualizar correctamente', async () => {
    mockPrisma.turno.findFirst
      .mockResolvedValueOnce(turnoBase)
      .mockResolvedValueOnce(null);
    mockPrisma.turno.update.mockResolvedValue({ ...turnoBase, hFin: '14:00' });

    const res = await request(app)
      .put('/api/turnos/uuid-turno')
      .set('Authorization', `Bearer ${tokenDirector()}`)
      .send({ hFin: '14:00' });

    expect(res.status).toBe(200);
    expect(res.body.hFin).toBe('14:00');
  });

  it('debe retornar 404 si el turno no existe', async () => {
    mockPrisma.turno.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/turnos/uuid-inexistente')
      .set('Authorization', `Bearer ${tokenDirector()}`)
      .send({ hFin: '14:00' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/turnos/:id', () => {

  it('debe retornar 204 al eliminar correctamente', async () => {
    mockPrisma.turno.findFirst.mockResolvedValue(turnoBase);
    mockPrisma.turno.update.mockResolvedValue({ ...turnoBase, activo: false });

    const res = await request(app)
      .delete('/api/turnos/uuid-turno')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(204);
  });

  it('debe retornar 404 si el turno no existe', async () => {
    mockPrisma.turno.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .delete('/api/turnos/uuid-inexistente')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(404);
  });
});
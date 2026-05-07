import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app';
import { mockPrisma } from '../mocks/prisma.mock';
import { mockReset } from 'vitest-mock-extended';
import jwt from 'jsonwebtoken';

const UUID_ESC = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

const tokenDirector = () => jwt.sign(
  { id: 'uuid-director', rol: 'director', idEsc: UUID_ESC },
  process.env.JWT_SECRET!,
  { expiresIn: '1h' }
);

const tokenAdmin = () => jwt.sign(
  { id: 'uuid-admin', rol: 'admin' },
  process.env.JWT_SECRET!,
  { expiresIn: '1h' }
);

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

describe('GET /api/director/turnos', () => {

  it('debe retornar 200 con lista de turnos', async () => {
    mockPrisma.turno.findMany.mockResolvedValue([turnoBase]);

    const res = await request(app)
      .get('/api/director/turnos')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it('debe retornar 401 sin token', async () => {
    const res = await request(app).get('/api/director/turnos');
    expect(res.status).toBe(401);
  });

  it('debe retornar 403 con token de supervisor', async () => {
    const res = await request(app)
      .get('/api/director/turnos')
      .set('Authorization', `Bearer ${tokenAdmin()}`);
    expect(res.status).toBe(403);
  });
});

describe('GET /api/director/turnos/:id', () => {

  it('debe retornar 200 con el turno encontrado', async () => {
    mockPrisma.turno.findFirst.mockResolvedValue(turnoBase);

    const res = await request(app)
      .get('/api/director/turnos/uuid-turno')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(200);
    expect(res.body.nombre).toBe('Matutino');
  });

  it('debe retornar 404 si el turno no existe', async () => {
    mockPrisma.turno.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .get('/api/director/turnos/uuid-inexistente')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(404);
  });
});

describe('POST /api/director/turnos', () => {

  it('debe retornar 201 al crear turno correctamente', async () => {
    mockPrisma.turno.findFirst.mockResolvedValue(null);
    mockPrisma.turno.create.mockResolvedValue(turnoBase);

    const res = await request(app)
      .post('/api/director/turnos')
      .set('Authorization', `Bearer ${tokenDirector()}`)
      .send({ nombre: 'Matutino', hInicio: '07:00', hFin: '13:00' });

    expect(res.status).toBe(201);
    expect(res.body.nombre).toBe('Matutino');
  });

  it('debe retornar 409 si el nombre ya existe', async () => {
    mockPrisma.turno.findFirst.mockResolvedValue(turnoBase);

    const res = await request(app)
      .post('/api/director/turnos')
      .set('Authorization', `Bearer ${tokenDirector()}`)
      .send({ nombre: 'Matutino', hInicio: '07:00', hFin: '13:00' });

    expect(res.status).toBe(409);
  });

  it('debe retornar 400 si faltan campos requeridos', async () => {
    const res = await request(app)
      .post('/api/director/turnos')
      .set('Authorization', `Bearer ${tokenDirector()}`)
      .send({ nombre: 'Matutino' });

    expect(res.status).toBe(400);
  });
});

describe('PUT /api/director/turnos/:id', () => {

  it('debe retornar 200 al actualizar correctamente', async () => {
    mockPrisma.turno.findFirst
      .mockResolvedValueOnce(turnoBase)
      .mockResolvedValueOnce(null);
    mockPrisma.turno.update.mockResolvedValue({ ...turnoBase, hFin: '14:00' });

    const res = await request(app)
      .put('/api/director/turnos/uuid-turno')
      .set('Authorization', `Bearer ${tokenDirector()}`)
      .send({ hFin: '14:00' });

    expect(res.status).toBe(200);
    expect(res.body.hFin).toBe('14:00');
  });

  it('debe retornar 404 si el turno no existe', async () => {
    mockPrisma.turno.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/director/turnos/uuid-inexistente')
      .set('Authorization', `Bearer ${tokenDirector()}`)
      .send({ hFin: '14:00' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/director/turnos/:id', () => {

  it('debe retornar 204 al eliminar correctamente', async () => {
    mockPrisma.turno.findFirst.mockResolvedValue(turnoBase);
    mockPrisma.turno.update.mockResolvedValue({ ...turnoBase, activo: false });

    const res = await request(app)
      .delete('/api/director/turnos/uuid-turno')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(204);
  });

  it('debe retornar 404 si el turno no existe', async () => {
    mockPrisma.turno.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .delete('/api/director/turnos/uuid-inexistente')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(404);
  });
});
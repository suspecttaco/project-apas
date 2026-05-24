import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app';
import { mockPrisma } from '../mocks/prisma.mock';
import { mockReset } from 'vitest-mock-extended';
import { tokenDirector, UUID_ESC } from './setup';

const UUID_GRADO = 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
const UUID_TURNO = 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

const grupoBase = {
  id:      'uuid-grupo',
  idEsc:   UUID_ESC,
  idGrado: UUID_GRADO,
  idTurno: UUID_TURNO,
  nombre:  'A',
  activo:  true,
  fCre:    new Date(),
  fMod:    new Date(),
};

beforeEach(() => {
  mockReset(mockPrisma);
});

describe('GET /api/grupos', () => {

  it('debe retornar 200 con lista de grupos', async () => {
    mockPrisma.grupo.findMany.mockResolvedValue([grupoBase]);

    const res = await request(app)
      .get('/api/grupos')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it('debe retornar 401 sin token', async () => {
    const res = await request(app).get('/api/grupos');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/grupos/:id', () => {

  it('debe retornar 200 con el grupo encontrado', async () => {
    mockPrisma.grupo.findFirst.mockResolvedValue(grupoBase);

    const res = await request(app)
      .get('/api/grupos/uuid-grupo')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(200);
    expect(res.body.nombre).toBe('A');
  });

  it('debe retornar 404 si el grupo no existe', async () => {
    mockPrisma.grupo.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .get('/api/grupos/uuid-inexistente')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(404);
  });
});

describe('POST /api/grupos', () => {

  it('debe retornar 201 al crear grupo correctamente', async () => {
    mockPrisma.grupo.findFirst.mockResolvedValue(null);
    mockPrisma.$transaction.mockImplementation(async (fn: any) => fn(mockPrisma));
    mockPrisma.grupo.create.mockResolvedValue(grupoBase);
    mockPrisma.ciclo.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/grupos')
      .set('Authorization', `Bearer ${tokenDirector()}`)
      .send({ idGrado: UUID_GRADO, idTurno: UUID_TURNO, nombre: 'A' });

    expect(res.status).toBe(201);
  });

  it('debe retornar 409 si el grupo ya existe', async () => {
    mockPrisma.grupo.findFirst.mockResolvedValue(grupoBase);

    const res = await request(app)
      .post('/api/grupos')
      .set('Authorization', `Bearer ${tokenDirector()}`)
      .send({ idGrado: UUID_GRADO, idTurno: UUID_TURNO, nombre: 'A' });

    expect(res.status).toBe(409);
  });

  it('debe retornar 400 si faltan campos requeridos', async () => {
    const res = await request(app)
      .post('/api/grupos')
      .set('Authorization', `Bearer ${tokenDirector()}`)
      .send({ nombre: 'A' });

    expect(res.status).toBe(400);
  });
});

describe('PUT /api/grupos/:id', () => {

  it('debe retornar 200 al actualizar correctamente', async () => {
    mockPrisma.grupo.findFirst
      .mockResolvedValueOnce(grupoBase)
      .mockResolvedValueOnce(grupoBase)
      .mockResolvedValueOnce(null);
    mockPrisma.grupo.update.mockResolvedValue({ ...grupoBase, nombre: 'B' });

    const res = await request(app)
      .put('/api/grupos/uuid-grupo')
      .set('Authorization', `Bearer ${tokenDirector()}`)
      .send({ nombre: 'B' });

    expect(res.status).toBe(200);
    expect(res.body.nombre).toBe('B');
  });

  it('debe retornar 404 si el grupo no existe', async () => {
    mockPrisma.grupo.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/grupos/uuid-inexistente')
      .set('Authorization', `Bearer ${tokenDirector()}`)
      .send({ nombre: 'B' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/grupos/:id', () => {

  it('debe retornar 204 al eliminar correctamente', async () => {
    mockPrisma.grupo.findFirst.mockResolvedValue(grupoBase);
    mockPrisma.grupo.update.mockResolvedValue({ ...grupoBase, activo: false });

    const res = await request(app)
      .delete('/api/grupos/uuid-grupo')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(204);
  });

  it('debe retornar 404 si el grupo no existe', async () => {
    mockPrisma.grupo.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .delete('/api/grupos/uuid-inexistente')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(404);
  });
});
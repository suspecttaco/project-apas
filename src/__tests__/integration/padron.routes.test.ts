import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app';
import { mockPrisma } from '../mocks/prisma.mock';
import { mockReset } from 'vitest-mock-extended';
import { tokenAdmin, tokenDirector, UUID_ESC } from './setup';

const UUID_CICLO = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

const padronBase = {
  id:      'uuid-padron',
  idCiclo: UUID_CICLO,
  idEsc:   UUID_ESC,
  status:  'generado',
  fGen:    new Date(),
  fMod:    new Date(),
  ciclo:   { id: UUID_CICLO, nombre: '2024-2025' },
};

beforeEach(() => {
  mockReset(mockPrisma);
});

describe('GET /api/padron/historial', () => {

  it('debe retornar 200 con historial de padrones para director', async () => {
    mockPrisma.padron.findMany.mockResolvedValue([padronBase] as any);

    const res = await request(app)
      .get('/api/padron/historial')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].status).toBe('generado');
  });

  it('debe retornar 401 sin token', async () => {
    const res = await request(app).get('/api/padron/historial');
    expect(res.status).toBe(401);
  });

  it('debe retornar 403 para admin sin idEsc', async () => {
    const res = await request(app)
      .get('/api/padron/historial')
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(403);
  });
});

describe('POST /api/padron/generar', () => {

  it('debe retornar 400 si falta idCiclo', async () => {
    const res = await request(app)
      .post('/api/padron/generar')
      .set('Authorization', `Bearer ${tokenDirector()}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it('debe retornar 400 si idCiclo no es UUID valido', async () => {
    const res = await request(app)
      .post('/api/padron/generar')
      .set('Authorization', `Bearer ${tokenDirector()}`)
      .send({ idCiclo: 'no-es-uuid' });

    expect(res.status).toBe(400);
  });

  it('debe retornar 404 si la escuela no existe', async () => {
    mockPrisma.escuela.findFirst.mockResolvedValue(null);
    mockPrisma.ciclo.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/padron/generar')
      .set('Authorization', `Bearer ${tokenDirector()}`)
      .send({ idCiclo: UUID_CICLO });

    expect(res.status).toBe(404);
  });

  it('debe retornar 401 sin token', async () => {
    const res = await request(app)
      .post('/api/padron/generar')
      .send({ idCiclo: UUID_CICLO });

    expect(res.status).toBe(401);
  });
});
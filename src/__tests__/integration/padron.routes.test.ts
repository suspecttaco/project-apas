import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app';
import { mockPrisma } from '../mocks/prisma.mock';
import { mockReset } from 'vitest-mock-extended';
import { tokenAdmin, tokenSupervisor, tokenDirector, UUID_ESC } from './setup';

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

//  GET /api/padron/historial 

describe('GET /api/padron/historial', () => {

  it('director: usa idEsc del token', async () => {
    mockPrisma.padron.findMany.mockResolvedValue([padronBase] as any);

    const res = await request(app)
      .get('/api/padron/historial')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].status).toBe('generado');
  });

  it('admin: usa idEsc del query param', async () => {
    mockPrisma.padron.findMany.mockResolvedValue([padronBase] as any);

    const res = await request(app)
      .get(`/api/padron/historial?idEsc=${UUID_ESC}`)
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it('supervisor: usa idEsc del query param', async () => {
    mockPrisma.padron.findMany.mockResolvedValue([padronBase] as any);

    const res = await request(app)
      .get(`/api/padron/historial?idEsc=${UUID_ESC}`)
      .set('Authorization', `Bearer ${tokenSupervisor()}`);

    expect(res.status).toBe(200);
  });

  it('admin sin idEsc retorna 400', async () => {
    const res = await request(app)
      .get('/api/padron/historial')
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(400);
  });

  it('supervisor sin idEsc retorna 400', async () => {
    const res = await request(app)
      .get('/api/padron/historial')
      .set('Authorization', `Bearer ${tokenSupervisor()}`);

    expect(res.status).toBe(400);
  });

  it('sin token retorna 401', async () => {
    const res = await request(app).get('/api/padron/historial');
    expect(res.status).toBe(401);
  });
});

//  POST /api/padron/generar 

describe('POST /api/padron/generar', () => {

  it('director: toma idEsc del token, no necesita idEsc en body', async () => {
    mockPrisma.escuela.findFirst.mockResolvedValue(null);
    mockPrisma.ciclo.findFirst.mockResolvedValue(null);

    // 404 porque el mock no encuentra datos, pero llega al servicio (no falla en 400)
    const res = await request(app)
      .post('/api/padron/generar')
      .set('Authorization', `Bearer ${tokenDirector()}`)
      .send({ idCiclo: UUID_CICLO });

    expect(res.status).toBe(404);
  });

  it('admin sin idEsc en body retorna 400', async () => {
    const res = await request(app)
      .post('/api/padron/generar')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ idCiclo: UUID_CICLO });

    expect(res.status).toBe(400);
  });

  it('supervisor sin idEsc en body retorna 400', async () => {
    const res = await request(app)
      .post('/api/padron/generar')
      .set('Authorization', `Bearer ${tokenSupervisor()}`)
      .send({ idCiclo: UUID_CICLO });

    expect(res.status).toBe(400);
  });

  it('admin con idEsc llega al servicio', async () => {
    mockPrisma.escuela.findFirst.mockResolvedValue(null);
    mockPrisma.ciclo.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/padron/generar')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ idCiclo: UUID_CICLO, idEsc: UUID_ESC });

    expect(res.status).toBe(404);
  });

  it('supervisor con idEsc llega al servicio', async () => {
    mockPrisma.escuela.findFirst.mockResolvedValue(null);
    mockPrisma.ciclo.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/padron/generar')
      .set('Authorization', `Bearer ${tokenSupervisor()}`)
      .send({ idCiclo: UUID_CICLO, idEsc: UUID_ESC });

    expect(res.status).toBe(404);
  });

  it('falta idCiclo retorna 400', async () => {
    const res = await request(app)
      .post('/api/padron/generar')
      .set('Authorization', `Bearer ${tokenDirector()}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it('idCiclo inválido retorna 400', async () => {
    const res = await request(app)
      .post('/api/padron/generar')
      .set('Authorization', `Bearer ${tokenDirector()}`)
      .send({ idCiclo: 'no-es-uuid' });

    expect(res.status).toBe(400);
  });

  it('sin token retorna 401', async () => {
    const res = await request(app)
      .post('/api/padron/generar')
      .send({ idCiclo: UUID_CICLO });

    expect(res.status).toBe(401);
  });
});
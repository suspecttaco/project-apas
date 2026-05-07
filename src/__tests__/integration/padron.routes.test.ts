import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app';
import { mockPrisma } from '../mocks/prisma.mock';
import { mockReset } from 'vitest-mock-extended';
import jwt from 'jsonwebtoken';

const UUID_ESC   = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
const UUID_CICLO = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

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

const padronBase = {
  id:      'uuid-padron',
  idCiclo: UUID_CICLO,
  idEsc:   UUID_ESC,
  status:  'generado',
  fGen:    new Date(),
  fMod:    new Date(),
  ciclo:   { id: UUID_CICLO, nombre: '2024-2025' },
};

const escuelaBase = {
  id:          UUID_ESC,
  nombre:      'Secundaria Test',
  clave:       'SIN0001',
  zonaEscolar: 'Z001',
  nivel:       'Secundaria',
  activo:      true,
  turnos:      [],
  fCre:        new Date(),
  fMod:        new Date(),
};

const cicloBase = {
  id:      UUID_CICLO,
  idEsc:   UUID_ESC,
  nombre:  '2024-2025',
  activo:  true,
  fInicio: new Date(),
  fFin:    new Date(),
  fCre:    new Date(),
  fMod:    new Date(),
  plan: {
    materias: [],
    grados:   [],
  },
};

beforeEach(() => {
  mockReset(mockPrisma);
});

describe('GET /api/director/padron/historial', () => {

  it('debe retornar 200 con historial de padrones', async () => {
    mockPrisma.padron.findMany.mockResolvedValue([padronBase] as any);

    const res = await request(app)
      .get('/api/director/padron/historial')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].status).toBe('generado');
  });

  it('debe retornar 401 sin token', async () => {
    const res = await request(app).get('/api/director/padron/historial');
    expect(res.status).toBe(401);
  });

  it('debe retornar 403 con token de supervisor', async () => {
    const res = await request(app)
      .get('/api/director/padron/historial')
      .set('Authorization', `Bearer ${tokenAdmin()}`);
    expect(res.status).toBe(403);
  });
});

describe('POST /api/director/padron/generar', () => {

  it('debe retornar 400 si falta idCiclo', async () => {
    const res = await request(app)
      .post('/api/director/padron/generar')
      .set('Authorization', `Bearer ${tokenDirector()}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it('debe retornar 400 si idCiclo no es UUID valido', async () => {
    const res = await request(app)
      .post('/api/director/padron/generar')
      .set('Authorization', `Bearer ${tokenDirector()}`)
      .send({ idCiclo: 'no-es-uuid' });

    expect(res.status).toBe(400);
  });

  it('debe retornar 404 si la escuela no existe', async () => {
    mockPrisma.escuela.findFirst.mockResolvedValue(null);
    mockPrisma.ciclo.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/director/padron/generar')
      .set('Authorization', `Bearer ${tokenDirector()}`)
      .send({ idCiclo: UUID_CICLO });

    expect(res.status).toBe(404);
  });

  it('debe retornar 401 sin token', async () => {
    const res = await request(app)
      .post('/api/director/padron/generar')
      .send({ idCiclo: UUID_CICLO });

    expect(res.status).toBe(401);
  });
});
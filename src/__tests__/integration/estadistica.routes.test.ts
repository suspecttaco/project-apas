import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app';
import { mockPrisma } from '../mocks/prisma.mock';
import { mockReset } from 'vitest-mock-extended';
import { tokenDirector, UUID_ESC } from './setup';

const UUID_CICLO = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
const UUID_GRUPO = 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

const statBase = {
  id:           'uuid-stat',
  idCiclo:      UUID_CICLO,
  idGrupo:      UUID_GRUPO,
  inscH:        15, inscM:  12,
  altasH:        1, altasM:   0,
  bajasH:        0, bajasM:   1,
  aprobTodosH:  null, aprobTodosM:  null,
  reprobH:      null, reprobM:      null,
  repetidoresH: null, repetidoresM: null,
  fCre:         new Date(),
  fMod:         new Date(),
  grupo:        { idEsc: UUID_ESC, grado: {}, turno: {} },
  ciclo:        {},
};

beforeEach(() => {
  mockReset(mockPrisma);
});

describe('GET /api/estadisticas', () => {

  it('debe retornar 200 con lista de estadisticas con calculos', async () => {
    mockPrisma.estadisticaAlumnos.findMany.mockResolvedValue([statBase] as any);

    const res = await request(app)
      .get('/api/estadisticas')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].existenciaH).toBe(16);
    expect(res.body[0].existenciaM).toBe(11);
    expect(res.body[0].existenciaT).toBe(27);
  });

  it('debe retornar 401 sin token', async () => {
    const res = await request(app).get('/api/estadisticas');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/estadisticas/:id', () => {

  it('debe retornar 200 con la estadistica encontrada', async () => {
    mockPrisma.estadisticaAlumnos.findFirst.mockResolvedValue(statBase as any);

    const res = await request(app)
      .get('/api/estadisticas/uuid-stat')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(200);
    expect(res.body.existenciaT).toBe(27);
  });

  it('debe retornar 404 si no existe', async () => {
    mockPrisma.estadisticaAlumnos.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .get('/api/estadisticas/uuid-inexistente')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/estadisticas/:id', () => {

  it('debe retornar 200 al actualizar y retornar calculos correctos', async () => {
    mockPrisma.estadisticaAlumnos.findFirst.mockResolvedValue(statBase as any);
    mockPrisma.estadisticaAlumnos.update.mockResolvedValue({
      ...statBase,
      inscH: 20, inscM: 18,
      altasH: 2, altasM: 1,
      bajasH: 1, bajasM: 0,
    } as any);

    const res = await request(app)
      .put('/api/estadisticas/uuid-stat')
      .set('Authorization', `Bearer ${tokenDirector()}`)
      .send({ inscH: 20, inscM: 18, altasH: 2, altasM: 1, bajasH: 1, bajasM: 0 });

    expect(res.status).toBe(200);
    expect(res.body.existenciaH).toBe(21);
    expect(res.body.existenciaM).toBe(19);
  });

  it('debe retornar 404 si no existe', async () => {
    mockPrisma.estadisticaAlumnos.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/estadisticas/uuid-inexistente')
      .set('Authorization', `Bearer ${tokenDirector()}`)
      .send({ inscH: 20 });

    expect(res.status).toBe(404);
  });

  it('debe retornar 400 si los datos son invalidos', async () => {
    const res = await request(app)
      .put('/api/estadisticas/uuid-stat')
      .set('Authorization', `Bearer ${tokenDirector()}`)
      .send({ inscH: -1 });

    expect(res.status).toBe(400);
  });
});
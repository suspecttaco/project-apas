import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app';
import { mockPrisma } from '../mocks/prisma.mock';
import { mockReset } from 'vitest-mock-extended';
import jwt from 'jsonwebtoken';

const UUID_ESC          = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
const UUID_EMPLEADO     = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
const UUID_NOMBRAMIENTO = 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
const UUID_MATERIA      = 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
const UUID_GRUPO        = 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

const tokenDirector = () => jwt.sign(
  { id: 'uuid-director', rol: 'director', idEsc: UUID_ESC },
  process.env.JWT_SECRET!,
  { expiresIn: '1h' }
);

const plazaBase = {
  id:             'uuid-plaza',
  idEmpleado:     UUID_EMPLEADO,
  idNombramiento: UUID_NOMBRAMIENTO,
  idMateria:      UUID_MATERIA,
  idEsc:          UUID_ESC,
  codigoPlaza:    '10EES0001P1A001',
  horasClase:     20,
  horasDescarga:  null,
  horasFortalec:  null,
  funcDescarga:   null,
  evaluado:       null,
  observaciones:  null,
  activo:         true,
  fCre:           new Date(),
  fMod:           new Date(),
  nombramiento:   { id: UUID_NOMBRAMIENTO, nombre: 'Profesor' },
  materia:        { id: UUID_MATERIA, nombre: 'Matematicas' },
  grupos:         [],
};

const empleadoBase = {
  id:         UUID_EMPLEADO,
  idEsc:      UUID_ESC,
  activo:     true,
  numControl: '2',
};

beforeEach(() => {
  mockReset(mockPrisma);
});

describe('GET /api/director/plazas', () => {

  it('debe retornar 200 con lista de plazas', async () => {
    mockPrisma.plaza.findMany.mockResolvedValue([plazaBase] as any);

    const res = await request(app)
      .get('/api/director/plazas')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it('debe retornar 401 sin token', async () => {
    const res = await request(app).get('/api/director/plazas');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/director/plazas/:id', () => {

  it('debe retornar 200 con la plaza encontrada', async () => {
    mockPrisma.plaza.findFirst.mockResolvedValue(plazaBase as any);

    const res = await request(app)
      .get('/api/director/plazas/uuid-plaza')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(200);
    expect(res.body.codigoPlaza).toBe('10EES0001P1A001');
  });

  it('debe retornar 404 si la plaza no existe', async () => {
    mockPrisma.plaza.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .get('/api/director/plazas/uuid-inexistente')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(404);
  });
});

describe('POST /api/director/plazas', () => {

  it('debe retornar 201 al crear plaza correctamente', async () => {
    mockPrisma.empleado.findFirst.mockResolvedValue(empleadoBase as any);
    mockPrisma.plaza.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(plazaBase as any);
    mockPrisma.$transaction.mockImplementation(async (fn: any) => fn(mockPrisma));
    mockPrisma.plaza.create.mockResolvedValue(plazaBase as any);
    mockPrisma.plazaGrupo.createMany.mockResolvedValue({ count: 1 });

    const res = await request(app)
      .post('/api/director/plazas')
      .set('Authorization', `Bearer ${tokenDirector()}`)
      .send({
        idEmpleado:     UUID_EMPLEADO,
        idNombramiento: UUID_NOMBRAMIENTO,
        idMateria:      UUID_MATERIA,
        codigoPlaza:    '10EES0001P1A001',
        horasClase:     20,
        idGrupos:       [UUID_GRUPO],
      });

    expect(res.status).toBe(201);
  });

  it('debe retornar 409 si el codigo de plaza ya existe', async () => {
    mockPrisma.empleado.findFirst.mockResolvedValue(empleadoBase as any);
    mockPrisma.plaza.findFirst.mockResolvedValue(plazaBase as any);

    const res = await request(app)
      .post('/api/director/plazas')
      .set('Authorization', `Bearer ${tokenDirector()}`)
      .send({
        idEmpleado:     UUID_EMPLEADO,
        idNombramiento: UUID_NOMBRAMIENTO,
        codigoPlaza:    '10EES0001P1A001',
      });

    expect(res.status).toBe(409);
  });

  it('debe retornar 400 si faltan campos requeridos', async () => {
    const res = await request(app)
      .post('/api/director/plazas')
      .set('Authorization', `Bearer ${tokenDirector()}`)
      .send({ codigoPlaza: '10EES0001P1A001' });

    expect(res.status).toBe(400);
  });
});

describe('PUT /api/director/plazas/:id', () => {

  it('debe retornar 200 al actualizar correctamente', async () => {
    mockPrisma.plaza.findFirst.mockResolvedValue(plazaBase as any);
    mockPrisma.$transaction.mockImplementation(async (fn: any) => fn(mockPrisma));
    mockPrisma.plaza.update.mockResolvedValue({ ...plazaBase, horasClase: 25 } as any);

    const res = await request(app)
      .put('/api/director/plazas/uuid-plaza')
      .set('Authorization', `Bearer ${tokenDirector()}`)
      .send({ horasClase: 25 });

    expect(res.status).toBe(200);
  });

  it('debe retornar 404 si la plaza no existe', async () => {
    mockPrisma.plaza.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/director/plazas/uuid-inexistente')
      .set('Authorization', `Bearer ${tokenDirector()}`)
      .send({ horasClase: 25 });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/director/plazas/:id', () => {

  it('debe retornar 204 al eliminar correctamente', async () => {
    mockPrisma.plaza.findFirst.mockResolvedValue(plazaBase as any);
    mockPrisma.plaza.update.mockResolvedValue({ ...plazaBase, activo: false } as any);

    const res = await request(app)
      .delete('/api/director/plazas/uuid-plaza')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(204);
  });

  it('debe retornar 404 si la plaza no existe', async () => {
    mockPrisma.plaza.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .delete('/api/director/plazas/uuid-inexistente')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(404);
  });
});
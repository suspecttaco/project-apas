import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app';
import { mockPrisma } from '../mocks/prisma.mock';
import { mockReset } from 'vitest-mock-extended';
import jwt from 'jsonwebtoken';

const UUID_ESC      = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
const UUID_EMPLEADO = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
const UUID_GRUPO    = 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
const UUID_MATERIA  = 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

const tokenDirector = () => jwt.sign(
  { id: 'uuid-director', rol: 'director', idEsc: UUID_ESC },
  process.env.JWT_SECRET!,
  { expiresIn: '1h' }
);

const slotBase = {
  id:         'uuid-slot',
  idEmpleado: UUID_EMPLEADO,
  idGrupo:    UUID_GRUPO,
  idMateria:  UUID_MATERIA,
  diaSemana:  'Lunes',
  hInicio:    '07:00',
  hFin:       '08:00',
  activo:     true,
  fCre:       new Date(),
  fMod:       new Date(),
  grupo:      { id: UUID_GRUPO, idEsc: UUID_ESC, nombre: 'A', grado: {} },
  materia:    { id: UUID_MATERIA, nombre: 'Matematicas' },
  empleado:   { id: UUID_EMPLEADO, persona: { nombre: 'Juan', appP: 'Perez' } },
};

const empleadoBase = { id: UUID_EMPLEADO, idEsc: UUID_ESC, activo: true };
const grupoBase    = { id: UUID_GRUPO,    idEsc: UUID_ESC, activo: true };

beforeEach(() => {
  mockReset(mockPrisma);
});

describe('GET /api/director/horarios/empleado/:idEmpleado', () => {

  it('debe retornar 200 con el horario del empleado', async () => {
    mockPrisma.empleado.findFirst.mockResolvedValue(empleadoBase as any);
    mockPrisma.horarioSlot.findMany.mockResolvedValue([slotBase] as any);

    const res = await request(app)
      .get(`/api/director/horarios/empleado/${UUID_EMPLEADO}`)
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it('debe retornar 404 si el empleado no existe', async () => {
    mockPrisma.empleado.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .get(`/api/director/horarios/empleado/${UUID_EMPLEADO}`)
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(404);
  });

  it('debe retornar 401 sin token', async () => {
    const res = await request(app)
      .get(`/api/director/horarios/empleado/${UUID_EMPLEADO}`);
    expect(res.status).toBe(401);
  });
});

describe('GET /api/director/horarios/grupo/:idGrupo', () => {

  it('debe retornar 200 con el horario del grupo', async () => {
    mockPrisma.grupo.findFirst.mockResolvedValue(grupoBase as any);
    mockPrisma.horarioSlot.findMany.mockResolvedValue([slotBase] as any);

    const res = await request(app)
      .get(`/api/director/horarios/grupo/${UUID_GRUPO}`)
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it('debe retornar 404 si el grupo no existe', async () => {
    mockPrisma.grupo.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .get(`/api/director/horarios/grupo/${UUID_GRUPO}`)
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(404);
  });
});

describe('POST /api/director/horarios', () => {

  it('debe retornar 201 al crear slot correctamente', async () => {
    mockPrisma.grupo.findFirst.mockResolvedValue(grupoBase as any);
    mockPrisma.empleado.findFirst.mockResolvedValue(empleadoBase as any);
    mockPrisma.horarioSlot.findFirst.mockResolvedValue(null);
    mockPrisma.horarioSlot.create.mockResolvedValue(slotBase as any);

    const res = await request(app)
      .post('/api/director/horarios')
      .set('Authorization', `Bearer ${tokenDirector()}`)
      .send({
        idGrupo:    UUID_GRUPO,
        idEmpleado: UUID_EMPLEADO,
        idMateria:  UUID_MATERIA,
        diaSemana:  'Lunes',
        hInicio:    '07:00',
        hFin:       '08:00',
      });

    expect(res.status).toBe(201);
  });

  it('debe retornar 409 si ya existe un slot en ese grupo, dia y hora', async () => {
    mockPrisma.grupo.findFirst.mockResolvedValue(grupoBase as any);
    mockPrisma.empleado.findFirst.mockResolvedValue(empleadoBase as any);
    mockPrisma.horarioSlot.findFirst.mockResolvedValue(slotBase as any);

    const res = await request(app)
      .post('/api/director/horarios')
      .set('Authorization', `Bearer ${tokenDirector()}`)
      .send({
        idGrupo:   UUID_GRUPO,
        diaSemana: 'Lunes',
        hInicio:   '07:00',
        hFin:      '08:00',
      });

    expect(res.status).toBe(409);
  });

  it('debe retornar 400 si faltan campos requeridos', async () => {
    const res = await request(app)
      .post('/api/director/horarios')
      .set('Authorization', `Bearer ${tokenDirector()}`)
      .send({ diaSemana: 'Lunes' });

    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/director/horarios/:id', () => {

  it('debe retornar 204 al eliminar correctamente', async () => {
    mockPrisma.horarioSlot.findFirst.mockResolvedValue(slotBase as any);
    mockPrisma.horarioSlot.update.mockResolvedValue({ ...slotBase, activo: false } as any);

    const res = await request(app)
      .delete('/api/director/horarios/uuid-slot')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(204);
  });

  it('debe retornar 404 si el slot no existe', async () => {
    mockPrisma.horarioSlot.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .delete('/api/director/horarios/uuid-inexistente')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(404);
  });
});
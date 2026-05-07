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

const personaBase = {
  id:     'uuid-persona',
  nombre: 'Juan',
  appP:   'Perez',
  appM:   'Lopez',
  activo: true,
  fCre:   new Date(),
  fMod:   new Date(),
  direccion: null,
  contacto:  null,
};

const empleadoBase = {
  id:          'uuid-empleado',
  idPersona:   'uuid-persona',
  idEsc:       UUID_ESC,
  numControl:  '2',
  rfc:         'PELJ800101ABC',
  curp:        'PELJ800101HSLRPN01',
  lugarNac:    null,
  estadoCivil: null,
  fIngreso:    new Date(),
  activo:      true,
  fCre:        new Date(),
  fMod:        new Date(),
  persona:     personaBase,
  preparacion: null,
  roles:       [],
};

beforeEach(() => {
  mockReset(mockPrisma);
});

describe('GET /api/director/empleados', () => {

  it('debe retornar 200 con lista de empleados', async () => {
    mockPrisma.empleado.findMany.mockResolvedValue([empleadoBase] as any);

    const res = await request(app)
      .get('/api/director/empleados')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it('debe retornar 401 sin token', async () => {
    const res = await request(app).get('/api/director/empleados');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/director/empleados/:id', () => {

  it('debe retornar 200 con el empleado encontrado', async () => {
    mockPrisma.empleado.findFirst.mockResolvedValue(empleadoBase as any);

    const res = await request(app)
      .get('/api/director/empleados/uuid-empleado')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(200);
    expect(res.body.rfc).toBe('PELJ800101ABC');
  });

  it('debe retornar 404 si el empleado no existe', async () => {
    mockPrisma.empleado.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .get('/api/director/empleados/uuid-inexistente')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(404);
  });
});

describe('POST /api/director/empleados', () => {

  it('debe retornar 201 al crear empleado correctamente', async () => {
    mockPrisma.empleado.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    mockPrisma.empleado.count.mockResolvedValue(0);
    mockPrisma.$transaction.mockImplementation(async (fn: any) => fn(mockPrisma));
    mockPrisma.persona.create.mockResolvedValue(personaBase as any);
    mockPrisma.empleado.create.mockResolvedValue(empleadoBase as any);

    const res = await request(app)
      .post('/api/director/empleados')
      .set('Authorization', `Bearer ${tokenDirector()}`)
      .send({
        nombre:   'Juan',
        appP:     'Perez',
        appM:     'Lopez',
        rfc:      'PELJ800101ABC',
        curp:     'PELJ800101HSLRPN01',
        fIngreso: '2010-08-16',
      });

    expect(res.status).toBe(201);
  });

  it('debe retornar 409 si el RFC ya existe', async () => {
    mockPrisma.empleado.findFirst.mockResolvedValue(empleadoBase as any);

    const res = await request(app)
      .post('/api/director/empleados')
      .set('Authorization', `Bearer ${tokenDirector()}`)
      .send({
        nombre:   'Juan',
        appP:     'Perez',
        rfc:      'PELJ800101ABC',
        curp:     'PELJ800101HSLRPN01',
        fIngreso: '2010-08-16',
      });

    expect(res.status).toBe(409);
  });

  it('debe retornar 400 si faltan campos requeridos', async () => {
    const res = await request(app)
      .post('/api/director/empleados')
      .set('Authorization', `Bearer ${tokenDirector()}`)
      .send({ nombre: 'Juan' });

    expect(res.status).toBe(400);
  });
});

describe('PUT /api/director/empleados/:id', () => {

  it('debe retornar 200 al actualizar correctamente', async () => {
    mockPrisma.empleado.findFirst.mockResolvedValue(empleadoBase as any);
    mockPrisma.$transaction.mockImplementation(async (fn: any) => fn(mockPrisma));
    mockPrisma.persona.update.mockResolvedValue(personaBase as any);
    mockPrisma.empleado.update.mockResolvedValue({
      ...empleadoBase,
      estadoCivil: 'Casado',
    } as any);

    const res = await request(app)
      .put('/api/director/empleados/uuid-empleado')
      .set('Authorization', `Bearer ${tokenDirector()}`)
      .send({ estadoCivil: 'Casado' });

    expect(res.status).toBe(200);
  });

  it('debe retornar 404 si el empleado no existe', async () => {
    mockPrisma.empleado.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/director/empleados/uuid-inexistente')
      .set('Authorization', `Bearer ${tokenDirector()}`)
      .send({ estadoCivil: 'Casado' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/director/empleados/:id', () => {

  it('debe retornar 204 al eliminar correctamente', async () => {
    mockPrisma.empleado.findFirst.mockResolvedValue(empleadoBase as any);
    mockPrisma.empleado.update.mockResolvedValue({ ...empleadoBase, activo: false } as any);

    const res = await request(app)
      .delete('/api/director/empleados/uuid-empleado')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(204);
  });

  it('debe retornar 404 si el empleado no existe', async () => {
    mockPrisma.empleado.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .delete('/api/director/empleados/uuid-inexistente')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(404);
  });
});
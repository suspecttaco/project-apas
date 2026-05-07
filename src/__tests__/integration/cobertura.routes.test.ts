import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app';
import { mockPrisma } from '../mocks/prisma.mock';
import { mockReset } from 'vitest-mock-extended';
import jwt from 'jsonwebtoken';

const UUID_ESC      = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
const UUID_TITULAR  = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
const UUID_SUPLENTE = 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

const tokenDirector = () => jwt.sign(
  { id: 'uuid-director', rol: 'director', idEsc: UUID_ESC },
  process.env.JWT_SECRET!,
  { expiresIn: '1h' }
);

const empleadoBase = (id: string, numControl: string) => ({
  id,
  idEsc:      UUID_ESC,
  numControl,
  activo:     true,
  idPersona:  'uuid-persona',
  rfc:        'TEST000000AAA',
  curp:       'TEST000000HSLRPN01',
  lugarNac:   null,
  estadoCivil: null,
  fIngreso:   new Date(),
  fCre:       new Date(),
  fMod:       new Date(),
});

const coberturaBase = {
  id:                'uuid-cobertura',
  idEmpleadoTitular: UUID_TITULAR,
  idEmpleadoCubre:   UUID_SUPLENTE,
  numControlTemp:    '1.1',
  fInicio:           new Date(),
  fFin:              null,
  motivo:            null,
  activo:            true,
  fCre:              new Date(),
  fMod:              new Date(),
  titular:  { ...empleadoBase(UUID_TITULAR,  '1'), persona: {} },
  suplente: { ...empleadoBase(UUID_SUPLENTE, '2'), persona: {} },
};

beforeEach(() => {
  mockReset(mockPrisma);
});

describe('GET /api/director/coberturas', () => {

  it('debe retornar 200 con lista de coberturas', async () => {
    mockPrisma.cobertura.findMany.mockResolvedValue([coberturaBase] as any);

    const res = await request(app)
      .get('/api/director/coberturas')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it('debe retornar 401 sin token', async () => {
    const res = await request(app).get('/api/director/coberturas');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/director/coberturas/:id', () => {

  it('debe retornar 200 con la cobertura encontrada', async () => {
    mockPrisma.cobertura.findFirst.mockResolvedValue(coberturaBase as any);

    const res = await request(app)
      .get('/api/director/coberturas/uuid-cobertura')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(200);
    expect(res.body.numControlTemp).toBe('1.1');
  });

  it('debe retornar 404 si la cobertura no existe', async () => {
    mockPrisma.cobertura.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .get('/api/director/coberturas/uuid-inexistente')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(404);
  });
});

describe('POST /api/director/coberturas', () => {

  it('debe retornar 201 al abrir cobertura correctamente', async () => {
    mockPrisma.empleado.findFirst
      .mockResolvedValueOnce(empleadoBase(UUID_TITULAR,  '1') as any)
      .mockResolvedValueOnce(empleadoBase(UUID_SUPLENTE, '2') as any);
    mockPrisma.cobertura.findFirst.mockResolvedValue(null);
    mockPrisma.cobertura.count.mockResolvedValue(0);
    mockPrisma.cobertura.create.mockResolvedValue(coberturaBase as any);

    const res = await request(app)
      .post('/api/director/coberturas')
      .set('Authorization', `Bearer ${tokenDirector()}`)
      .send({
        idEmpleadoTitular: UUID_TITULAR,
        idEmpleadoCubre:   UUID_SUPLENTE,
        fInicio:           '2024-09-01',
      });

    expect(res.status).toBe(201);
    expect(res.body.numControlTemp).toBe('1.1');
  });

  it('debe retornar 409 si el suplente ya tiene cobertura activa', async () => {
    mockPrisma.empleado.findFirst
      .mockResolvedValueOnce(empleadoBase(UUID_TITULAR,  '1') as any)
      .mockResolvedValueOnce(empleadoBase(UUID_SUPLENTE, '2') as any);
    mockPrisma.cobertura.findFirst.mockResolvedValue(coberturaBase as any);

    const res = await request(app)
      .post('/api/director/coberturas')
      .set('Authorization', `Bearer ${tokenDirector()}`)
      .send({
        idEmpleadoTitular: UUID_TITULAR,
        idEmpleadoCubre:   UUID_SUPLENTE,
        fInicio:           '2024-09-01',
      });

    expect(res.status).toBe(409);
  });

  it('debe retornar 400 si faltan campos requeridos', async () => {
    const res = await request(app)
      .post('/api/director/coberturas')
      .set('Authorization', `Bearer ${tokenDirector()}`)
      .send({ idEmpleadoTitular: UUID_TITULAR });

    expect(res.status).toBe(400);
  });
});

describe('PUT /api/director/coberturas/:id/cerrar', () => {

  it('debe retornar 200 al cerrar cobertura correctamente', async () => {
    mockPrisma.cobertura.findFirst.mockResolvedValue({
      ...coberturaBase,
      titular: empleadoBase(UUID_TITULAR, '1'),
    } as any);
    mockPrisma.cobertura.update.mockResolvedValue({
      ...coberturaBase,
      fFin:    new Date(),
      titular:  { ...empleadoBase(UUID_TITULAR,  '1'), persona: {} },
      suplente: { ...empleadoBase(UUID_SUPLENTE, '2'), persona: {} },
    } as any);

    const res = await request(app)
      .put('/api/director/coberturas/uuid-cobertura/cerrar')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(200);
    expect(res.body.fFin).toBeDefined();
  });

  it('debe retornar 404 si la cobertura no existe', async () => {
    mockPrisma.cobertura.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/director/coberturas/uuid-inexistente/cerrar')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(404);
  });

  it('debe retornar 409 si la cobertura ya esta cerrada', async () => {
    mockPrisma.cobertura.findFirst.mockResolvedValue({
      ...coberturaBase,
      fFin:    new Date(),
      titular: empleadoBase(UUID_TITULAR, '1'),
    } as any);

    const res = await request(app)
      .put('/api/director/coberturas/uuid-cobertura/cerrar')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(409);
  });
});
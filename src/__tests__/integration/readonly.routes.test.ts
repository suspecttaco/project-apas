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

beforeEach(() => {
  mockReset(mockPrisma);
});

//  Plan de Estudios 

describe('GET /api/plan-estudios', () => {

  it('debe retornar 200 con lista de planes', async () => {
    mockPrisma.planEstudios.findMany.mockResolvedValue([{
      id: 'uuid-plan', nombre: 'Plan 2017', desc: null,
      activo: true, fCre: new Date(), fMod: new Date(),
    }]);

    const res = await request(app)
      .get('/api/plan-estudios')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it('debe retornar 200 con token de supervisor tambien', async () => {
    mockPrisma.planEstudios.findMany.mockResolvedValue([]);

    const res = await request(app)
      .get('/api/plan-estudios')
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(200);
  });

  it('debe retornar 401 sin token', async () => {
    const res = await request(app).get('/api/plan-estudios');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/plan-estudios/:id', () => {

  it('debe retornar 200 con el plan encontrado', async () => {
    mockPrisma.planEstudios.findFirst.mockResolvedValue({
      id: 'uuid-plan', nombre: 'Plan 2017', desc: null,
      activo: true, fCre: new Date(), fMod: new Date(),
      grados: [], materias: [],
    } as any);

    const res = await request(app)
      .get('/api/plan-estudios/uuid-plan')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(200);
    expect(res.body.nombre).toBe('Plan 2017');
  });

  it('debe retornar 404 si no existe', async () => {
    mockPrisma.planEstudios.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .get('/api/plan-estudios/uuid-inexistente')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(404);
  });
});

//  Grados 

describe('GET /api/grados', () => {

  it('debe retornar 200 con lista de grados', async () => {
    mockPrisma.grado.findMany.mockResolvedValue([{
      id: 'uuid-grado', idPlan: 'uuid-plan', nombre: 'Primer Grado',
      numero: 1, activo: true, fCre: new Date(), fMod: new Date(),
    }]);

    const res = await request(app)
      .get('/api/grados')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it('debe retornar 401 sin token', async () => {
    const res = await request(app).get('/api/grados');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/grados/:id', () => {

  it('debe retornar 200 con el grado encontrado', async () => {
    mockPrisma.grado.findFirst.mockResolvedValue({
      id: 'uuid-grado', idPlan: 'uuid-plan', nombre: 'Primer Grado',
      numero: 1, activo: true, fCre: new Date(), fMod: new Date(),
    });

    const res = await request(app)
      .get('/api/grados/uuid-grado')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(200);
    expect(res.body.numero).toBe(1);
  });

  it('debe retornar 404 si no existe', async () => {
    mockPrisma.grado.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .get('/api/grados/uuid-inexistente')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(404);
  });
});

//  Materias 

describe('GET /api/materias', () => {

  it('debe retornar 200 con lista de materias', async () => {
    mockPrisma.materia.findMany.mockResolvedValue([{
      id: 'uuid-materia', idPlan: 'uuid-plan', nombre: 'Matematicas',
      desc: null, activo: true, fCre: new Date(), fMod: new Date(),
    }]);

    const res = await request(app)
      .get('/api/materias')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it('debe retornar 401 sin token', async () => {
    const res = await request(app).get('/api/materias');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/materias/:id', () => {

  it('debe retornar 200 con la materia encontrada', async () => {
    mockPrisma.materia.findFirst.mockResolvedValue({
      id: 'uuid-materia', idPlan: 'uuid-plan', nombre: 'Matematicas',
      desc: null, activo: true, fCre: new Date(), fMod: new Date(),
    });

    const res = await request(app)
      .get('/api/materias/uuid-materia')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(200);
    expect(res.body.nombre).toBe('Matematicas');
  });

  it('debe retornar 404 si no existe', async () => {
    mockPrisma.materia.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .get('/api/materias/uuid-inexistente')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(404);
  });
});

//  Nombramientos 

describe('GET /api/nombramientos', () => {

  it('debe retornar 200 con lista de nombramientos', async () => {
    mockPrisma.nombramiento.findMany.mockResolvedValue([{
      id: 'uuid-nombramiento', nombre: 'Profesor de Educacion Secundaria',
      activo: true, fCre: new Date(), fMod: new Date(),
    }]);

    const res = await request(app)
      .get('/api/nombramientos')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it('debe retornar 401 sin token', async () => {
    const res = await request(app).get('/api/nombramientos');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/nombramientos/:id', () => {

  it('debe retornar 200 con el nombramiento encontrado', async () => {
    mockPrisma.nombramiento.findFirst.mockResolvedValue({
      id: 'uuid-nombramiento', nombre: 'Profesor de Educacion Secundaria',
      activo: true, fCre: new Date(), fMod: new Date(),
    });

    const res = await request(app)
      .get('/api/nombramientos/uuid-nombramiento')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(200);
    expect(res.body.nombre).toBe('Profesor de Educacion Secundaria');
  });

  it('debe retornar 404 si no existe', async () => {
    mockPrisma.nombramiento.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .get('/api/nombramientos/uuid-inexistente')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(404);
  });
});

//  Roles Empleado 

describe('GET /api/roles-empleado', () => {

  it('debe retornar 200 con lista de roles', async () => {
    mockPrisma.rolEmpleado.findMany.mockResolvedValue([{
      id: 'uuid-rol', nombre: 'Docente', desc: null,
      activo: true, fCre: new Date(), fMod: new Date(),
    }]);

    const res = await request(app)
      .get('/api/roles-empleado')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it('debe retornar 401 sin token', async () => {
    const res = await request(app).get('/api/roles-empleado');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/roles-empleado/:id', () => {

  it('debe retornar 200 con el rol encontrado', async () => {
    mockPrisma.rolEmpleado.findFirst.mockResolvedValue({
      id: 'uuid-rol', nombre: 'Docente', desc: null,
      activo: true, fCre: new Date(), fMod: new Date(),
    });

    const res = await request(app)
      .get('/api/roles-empleado/uuid-rol')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(200);
    expect(res.body.nombre).toBe('Docente');
  });

  it('debe retornar 404 si no existe', async () => {
    mockPrisma.rolEmpleado.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .get('/api/roles-empleado/uuid-inexistente')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(404);
  });
});
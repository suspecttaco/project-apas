import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import app from '../../app';
import { mockPrisma } from '../mocks/prisma.mock';
import { mockReset } from 'vitest-mock-extended';
import { tokenAdmin, tokenSupervisor, tokenDirector } from './setup';

beforeEach(() => {
  mockReset(mockPrisma);
});

const planNoActual = { id: 'a0000000-0000-4000-8000-000000000001', activo: true, actual: false };
const planActual   = { id: 'a0000000-0000-4000-8000-000000000001', activo: true, actual: true  };

// ─── Grado ───────────────────────────────────────────────────────────────────

describe('POST /api/grados', () => {
  it('debe crear un grado con token admin', async () => {
    mockPrisma.planEstudios.findFirst.mockResolvedValue(planNoActual as any);
    mockPrisma.grado.findFirst.mockResolvedValue(null);
    mockPrisma.grado.create.mockResolvedValue({
      id: 'uuid-grado', idPlan: 'a0000000-0000-4000-8000-000000000001', nombre: 'Primer Grado',
      numero: 1, activo: true, fCre: new Date(), fMod: new Date(),
    });

    const res = await request(app)
      .post('/api/grados')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ idPlan: 'a0000000-0000-4000-8000-000000000001', nombre: 'Primer Grado', numero: 1 });

    expect(res.status).toBe(201);
    expect(res.body.numero).toBe(1);
  });

  it('debe crear un grado con token supervisor', async () => {
    mockPrisma.planEstudios.findFirst.mockResolvedValue(planNoActual as any);
    mockPrisma.grado.findFirst.mockResolvedValue(null);
    mockPrisma.grado.create.mockResolvedValue({
      id: 'uuid-grado', idPlan: 'a0000000-0000-4000-8000-000000000001', nombre: 'Primer Grado',
      numero: 1, activo: true, fCre: new Date(), fMod: new Date(),
    });

    const res = await request(app)
      .post('/api/grados')
      .set('Authorization', `Bearer ${tokenSupervisor()}`)
      .send({ idPlan: 'a0000000-0000-4000-8000-000000000001', nombre: 'Primer Grado', numero: 1 });

    expect(res.status).toBe(201);
  });

  it('debe retornar 403 para director', async () => {
    const res = await request(app)
      .post('/api/grados')
      .set('Authorization', `Bearer ${tokenDirector()}`)
      .send({ idPlan: 'a0000000-0000-4000-8000-000000000001', nombre: 'Primer Grado', numero: 1 });

    expect(res.status).toBe(403);
  });

  it('debe retornar 409 si el plan es actual', async () => {
    mockPrisma.planEstudios.findFirst.mockResolvedValue(planActual as any);

    const res = await request(app)
      .post('/api/grados')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ idPlan: 'a0000000-0000-4000-8000-000000000001', nombre: 'Primer Grado', numero: 1 });

    expect(res.status).toBe(409);
  });

  it('debe retornar 422 si faltan campos', async () => {
    const res = await request(app)
      .post('/api/grados')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ nombre: 'Primer Grado' }); // sin idPlan ni numero

    expect(res.status).toBe(400);
  });

  it('debe retornar 401 sin token', async () => {
    const res = await request(app).post('/api/grados').send({});
    expect(res.status).toBe(401);
  });
});

describe('PUT /api/grados/:id', () => {
  const gradoBase = {
    id: 'uuid-grado', idPlan: 'a0000000-0000-4000-8000-000000000001', nombre: 'Primer Grado',
    numero: 1, activo: true, fCre: new Date(), fMod: new Date(),
  };

  it('debe actualizar un grado con token admin', async () => {
    mockPrisma.grado.findFirst.mockResolvedValue(gradoBase);
    mockPrisma.grado.update.mockResolvedValue({ ...gradoBase, nombre: 'Primer Grado Actualizado' });

    const res = await request(app)
      .put('/api/grados/a0000000-0000-4000-8000-000000000001')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ nombre: 'Primer Grado Actualizado' });

    expect(res.status).toBe(200);
    expect(res.body.nombre).toBe('Primer Grado Actualizado');
  });

  it('debe retornar 404 si no existe', async () => {
    mockPrisma.grado.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/grados/a0000000-0000-4000-8000-000000000099')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ nombre: 'X' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/grados/:id', () => {
  const gradoBase = {
    id: 'uuid-grado', idPlan: 'a0000000-0000-4000-8000-000000000001', nombre: 'Primer Grado',
    numero: 1, activo: true, fCre: new Date(), fMod: new Date(),
  };

  it('debe desactivar un grado si el plan no es actual', async () => {
    mockPrisma.grado.findFirst.mockResolvedValue(gradoBase);
    mockPrisma.planEstudios.findFirst.mockResolvedValue({ id: 'a0000000-0000-4000-8000-000000000001', actual: false } as any);
    mockPrisma.grado.update.mockResolvedValue({ ...gradoBase, activo: false });

    const res = await request(app)
      .delete('/api/grados/a0000000-0000-4000-8000-000000000001')
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(204);
  });

  it('debe retornar 409 si el plan es actual', async () => {
    mockPrisma.grado.findFirst.mockResolvedValue(gradoBase);
    mockPrisma.planEstudios.findFirst.mockResolvedValue({ id: 'a0000000-0000-4000-8000-000000000001', actual: true } as any);

    const res = await request(app)
      .delete('/api/grados/a0000000-0000-4000-8000-000000000001')
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(409);
  });
});

// ─── Materia ──────────────────────────────────────────────────────────────────

describe('POST /api/materias', () => {
  it('debe crear una materia con token admin', async () => {
    mockPrisma.planEstudios.findFirst.mockResolvedValue(planNoActual as any);
    mockPrisma.materia.findFirst.mockResolvedValue(null);
    mockPrisma.materia.create.mockResolvedValue({
      id: 'uuid-materia', idPlan: 'a0000000-0000-4000-8000-000000000001', nombre: 'Matematicas',
      desc: null, activo: true, fCre: new Date(), fMod: new Date(),
    });

    const res = await request(app)
      .post('/api/materias')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ idPlan: 'a0000000-0000-4000-8000-000000000001', nombre: 'Matematicas' });

    expect(res.status).toBe(201);
    expect(res.body.nombre).toBe('Matematicas');
  });

  it('debe retornar 403 para director', async () => {
    const res = await request(app)
      .post('/api/materias')
      .set('Authorization', `Bearer ${tokenDirector()}`)
      .send({ idPlan: 'a0000000-0000-4000-8000-000000000001', nombre: 'Matematicas' });

    expect(res.status).toBe(403);
  });

  it('debe retornar 409 si el plan es actual', async () => {
    mockPrisma.planEstudios.findFirst.mockResolvedValue(planActual as any);

    const res = await request(app)
      .post('/api/materias')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ idPlan: 'a0000000-0000-4000-8000-000000000001', nombre: 'Matematicas' });

    expect(res.status).toBe(409);
  });

  it('debe retornar 401 sin token', async () => {
    const res = await request(app).post('/api/materias').send({});
    expect(res.status).toBe(401);
  });
});

describe('PUT /api/materias/:id', () => {
  const materiaBase = {
    id: 'uuid-materia', idPlan: 'a0000000-0000-4000-8000-000000000001', nombre: 'Matematicas',
    desc: null, activo: true, fCre: new Date(), fMod: new Date(),
  };

  it('debe actualizar una materia', async () => {
    mockPrisma.materia.findFirst
      .mockResolvedValueOnce(materiaBase)
      .mockResolvedValueOnce(null);
    mockPrisma.materia.update.mockResolvedValue({ ...materiaBase, nombre: 'Matematicas Avanzadas' });

    const res = await request(app)
      .put('/api/materias/a0000000-0000-4000-8000-000000000001')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ nombre: 'Matematicas Avanzadas' });

    expect(res.status).toBe(200);
    expect(res.body.nombre).toBe('Matematicas Avanzadas');
  });

  it('debe retornar 404 si no existe', async () => {
    mockPrisma.materia.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/materias/a0000000-0000-4000-8000-000000000099')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ nombre: 'X' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/materias/:id', () => {
  const materiaBase = {
    id: 'uuid-materia', idPlan: 'a0000000-0000-4000-8000-000000000001', nombre: 'Matematicas',
    desc: null, activo: true, fCre: new Date(), fMod: new Date(),
  };

  it('debe desactivar una materia si el plan no es actual', async () => {
    mockPrisma.materia.findFirst.mockResolvedValue(materiaBase);
    mockPrisma.planEstudios.findFirst.mockResolvedValue({ id: 'a0000000-0000-4000-8000-000000000001', actual: false } as any);
    mockPrisma.materia.update.mockResolvedValue({ ...materiaBase, activo: false });

    const res = await request(app)
      .delete('/api/materias/a0000000-0000-4000-8000-000000000001')
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(204);
  });

  it('debe retornar 409 si el plan es actual', async () => {
    mockPrisma.materia.findFirst.mockResolvedValue(materiaBase);
    mockPrisma.planEstudios.findFirst.mockResolvedValue({ id: 'a0000000-0000-4000-8000-000000000001', actual: true } as any);

    const res = await request(app)
      .delete('/api/materias/a0000000-0000-4000-8000-000000000001')
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(409);
  });
});

// ─── Nombramiento ─────────────────────────────────────────────────────────────

describe('POST /api/nombramientos', () => {
  it('debe crear un nombramiento con token admin', async () => {
    mockPrisma.nombramiento.findFirst.mockResolvedValue(null);
    mockPrisma.nombramiento.create.mockResolvedValue({
      id: 'uuid-nom', nombre: 'Profesor de Telesecundaria',
      activo: true, fCre: new Date(), fMod: new Date(),
    });

    const res = await request(app)
      .post('/api/nombramientos')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ nombre: 'Profesor de Telesecundaria' });

    expect(res.status).toBe(201);
    expect(res.body.nombre).toBe('Profesor de Telesecundaria');
  });

  it('debe retornar 409 si el nombre ya existe', async () => {
    mockPrisma.nombramiento.findFirst.mockResolvedValue({ id: 'uuid-nom' } as any);

    const res = await request(app)
      .post('/api/nombramientos')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ nombre: 'Profesor de Telesecundaria' });

    expect(res.status).toBe(409);
  });

  it('debe retornar 403 para director', async () => {
    const res = await request(app)
      .post('/api/nombramientos')
      .set('Authorization', `Bearer ${tokenDirector()}`)
      .send({ nombre: 'X' });

    expect(res.status).toBe(403);
  });

  it('debe retornar 401 sin token', async () => {
    const res = await request(app).post('/api/nombramientos').send({});
    expect(res.status).toBe(401);
  });
});

describe('PUT /api/nombramientos/:id', () => {
  const nomBase = {
    id: 'uuid-nom', nombre: 'Profesor de Telesecundaria',
    activo: true, fCre: new Date(), fMod: new Date(),
  };

  it('debe actualizar un nombramiento', async () => {
    mockPrisma.nombramiento.findFirst
      .mockResolvedValueOnce(nomBase)
      .mockResolvedValueOnce(null);
    mockPrisma.nombramiento.update.mockResolvedValue({ ...nomBase, nombre: 'Profesor Actualizado' });

    const res = await request(app)
      .put('/api/nombramientos/a0000000-0000-4000-8000-000000000001')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ nombre: 'Profesor Actualizado' });

    expect(res.status).toBe(200);
    expect(res.body.nombre).toBe('Profesor Actualizado');
  });

  it('debe retornar 404 si no existe', async () => {
    mockPrisma.nombramiento.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/nombramientos/a0000000-0000-4000-8000-000000000099')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ nombre: 'X' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/nombramientos/:id', () => {
  it('debe desactivar un nombramiento', async () => {
    const nomBase = {
      id: 'uuid-nom', nombre: 'Profesor de Telesecundaria',
      activo: true, fCre: new Date(), fMod: new Date(),
    };
    mockPrisma.nombramiento.findFirst.mockResolvedValue(nomBase);
    mockPrisma.nombramiento.update.mockResolvedValue({ ...nomBase, activo: false });

    const res = await request(app)
      .delete('/api/nombramientos/a0000000-0000-4000-8000-000000000001')
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(204);
  });

  it('debe retornar 404 si no existe', async () => {
    mockPrisma.nombramiento.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .delete('/api/nombramientos/a0000000-0000-4000-8000-000000000099')
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(404);
  });
});

// ─── RolEmpleado ──────────────────────────────────────────────────────────────

describe('POST /api/roles-empleado', () => {
  it('debe crear un rol de empleado con token admin', async () => {
    mockPrisma.rolEmpleado.findFirst.mockResolvedValue(null);
    mockPrisma.rolEmpleado.create.mockResolvedValue({
      id: 'uuid-rol', nombre: 'Coordinador', desc: null,
      activo: true, fCre: new Date(), fMod: new Date(),
    });

    const res = await request(app)
      .post('/api/roles-empleado')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ nombre: 'Coordinador' });

    expect(res.status).toBe(201);
    expect(res.body.nombre).toBe('Coordinador');
  });

  it('debe retornar 409 si el nombre ya existe', async () => {
    mockPrisma.rolEmpleado.findFirst.mockResolvedValue({ id: 'uuid-rol' } as any);

    const res = await request(app)
      .post('/api/roles-empleado')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ nombre: 'Coordinador' });

    expect(res.status).toBe(409);
  });

  it('debe retornar 403 para director', async () => {
    const res = await request(app)
      .post('/api/roles-empleado')
      .set('Authorization', `Bearer ${tokenDirector()}`)
      .send({ nombre: 'X' });

    expect(res.status).toBe(403);
  });

  it('debe retornar 401 sin token', async () => {
    const res = await request(app).post('/api/roles-empleado').send({});
    expect(res.status).toBe(401);
  });
});

describe('PUT /api/roles-empleado/:id', () => {
  const rolBase = {
    id: 'uuid-rol', nombre: 'Coordinador', desc: null,
    activo: true, fCre: new Date(), fMod: new Date(),
  };

  it('debe actualizar un rol de empleado', async () => {
    mockPrisma.rolEmpleado.findFirst
      .mockResolvedValueOnce(rolBase)
      .mockResolvedValueOnce(null);
    mockPrisma.rolEmpleado.update.mockResolvedValue({ ...rolBase, nombre: 'Subdirector' });

    const res = await request(app)
      .put('/api/roles-empleado/a0000000-0000-4000-8000-000000000001')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ nombre: 'Subdirector' });

    expect(res.status).toBe(200);
    expect(res.body.nombre).toBe('Subdirector');
  });

  it('debe retornar 404 si no existe', async () => {
    mockPrisma.rolEmpleado.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/roles-empleado/a0000000-0000-4000-8000-000000000099')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ nombre: 'X' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/roles-empleado/:id', () => {
  it('debe desactivar un rol de empleado', async () => {
    const rolBase = {
      id: 'uuid-rol', nombre: 'Coordinador', desc: null,
      activo: true, fCre: new Date(), fMod: new Date(),
    };
    mockPrisma.rolEmpleado.findFirst.mockResolvedValue(rolBase);
    mockPrisma.rolEmpleado.update.mockResolvedValue({ ...rolBase, activo: false });

    const res = await request(app)
      .delete('/api/roles-empleado/a0000000-0000-4000-8000-000000000001')
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(204);
  });

  it('debe retornar 404 si no existe', async () => {
    mockPrisma.rolEmpleado.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .delete('/api/roles-empleado/a0000000-0000-4000-8000-000000000099')
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(404);
  });
});

// ─── PlanEstudios escritura ───────────────────────────────────────────────────

describe('POST /api/plan-estudios', () => {
  it('debe crear un plan con token admin', async () => {
    const planMock = {
      id: 'a0000000-0000-4000-8000-000000000001', nombre: 'Plan Nuevo', desc: null,
      actual: false, activo: true, fCre: new Date(), fMod: new Date(),
    };
    mockPrisma.planEstudios.findFirst.mockResolvedValue(null);
    mockPrisma.$transaction.mockImplementation(async (cb: any) => cb({
      planEstudios: { create: vi.fn().mockResolvedValue(planMock), findFirst: vi.fn().mockResolvedValue(planMock) },
      grado:        { create: vi.fn().mockResolvedValue({}) },
      materia:      { create: vi.fn().mockResolvedValue({}) },
    }));

    const res = await request(app)
      .post('/api/plan-estudios')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ nombre: 'Plan Nuevo', grados: [{ nombre: 'Primer Grado', numero: 1 }], materias: [{ nombre: 'Matematicas' }] });

    expect(res.status).toBe(201);
    expect(res.body.nombre).toBe('Plan Nuevo');
  });

  it('debe retornar 403 para director', async () => {
    const res = await request(app)
      .post('/api/plan-estudios')
      .set('Authorization', `Bearer ${tokenDirector()}`)
      .send({ nombre: 'Plan Nuevo', grados: [{ nombre: 'Primer Grado', numero: 1 }], materias: [{ nombre: 'Matematicas' }] });

    expect(res.status).toBe(403);
  });

  it('debe retornar 409 si el nombre ya existe', async () => {
    mockPrisma.planEstudios.findFirst.mockResolvedValue({ id: 'a0000000-0000-4000-8000-000000000001' } as any);

    const res = await request(app)
      .post('/api/plan-estudios')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ nombre: 'Plan Existente', grados: [{ nombre: 'Primer Grado', numero: 1 }], materias: [{ nombre: 'Matematicas' }] });

    expect(res.status).toBe(409);
  });
});

describe('PUT /api/plan-estudios/:id', () => {
  const planBase = {
    id: 'a0000000-0000-4000-8000-000000000001', nombre: 'Plan 2017', desc: null,
    actual: false, activo: true, fCre: new Date(), fMod: new Date(),
  };

  it('debe actualizar nombre del plan', async () => {
    mockPrisma.planEstudios.findFirst
      .mockResolvedValueOnce({ ...planBase, grados: [], materias: [] } as any) // getById
      .mockResolvedValueOnce(null);                                             // check nombre duplicado
    mockPrisma.planEstudios.update.mockResolvedValue({ ...planBase, nombre: 'Plan 2020', grados: [], materias: [] } as any);

    const res = await request(app)
      .put(`/api/plan-estudios/${planBase.id}`)
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ nombre: 'Plan 2020' });

    expect(res.status).toBe(200);
    expect(res.body.nombre).toBe('Plan 2020');
  });

  it('debe retornar 404 si no existe', async () => {
    mockPrisma.planEstudios.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/plan-estudios/a0000000-0000-4000-8000-000000000099')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ nombre: 'X' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/plan-estudios/:id', () => {
  it('debe desactivar un plan si no es actual y sin ciclos', async () => {
    mockPrisma.planEstudios.findFirst.mockResolvedValue({
      id: 'a0000000-0000-4000-8000-000000000001', actual: false, activo: true,
    } as any);
    mockPrisma.ciclo.findFirst.mockResolvedValue(null);
    mockPrisma.planEstudios.update.mockResolvedValue({
      id: 'a0000000-0000-4000-8000-000000000001', activo: false,
    } as any);

    const res = await request(app)
      .delete('/api/plan-estudios/a0000000-0000-4000-8000-000000000001')
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(204);
  });

  it('debe retornar 409 si el plan es actual', async () => {
    mockPrisma.planEstudios.findFirst.mockResolvedValue({
      id: 'a0000000-0000-4000-8000-000000000001', actual: true, activo: true,
    } as any);

    const res = await request(app)
      .delete('/api/plan-estudios/a0000000-0000-4000-8000-000000000001')
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(409);
  });

  it('debe retornar 409 si tiene ciclos asociados', async () => {
    mockPrisma.planEstudios.findFirst.mockResolvedValue({
      id: 'a0000000-0000-4000-8000-000000000001', actual: false, activo: true,
    } as any);
    mockPrisma.ciclo.findFirst.mockResolvedValue({ id: "uuid-ciclo" } as any);

    const res = await request(app)
      .delete('/api/plan-estudios/a0000000-0000-4000-8000-000000000001')
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(409);
  });
});

describe('PUT /api/plan-estudios/:id/activar', () => {
  it('debe activar un plan con token admin', async () => {
    mockPrisma.planEstudios.findFirst.mockResolvedValue({
      id: 'a0000000-0000-4000-8000-000000000001', actual: false, activo: true,
    } as any);
    mockPrisma.$transaction.mockResolvedValue({
      id: 'a0000000-0000-4000-8000-000000000001', actual: true, activo: true,
    } as any);

    const res = await request(app)
      .put('/api/plan-estudios/a0000000-0000-4000-8000-000000000001/activar')
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(200);
  });

  it('debe retornar 409 si ya es el plan actual', async () => {
    mockPrisma.planEstudios.findFirst.mockResolvedValue({
      id: 'a0000000-0000-4000-8000-000000000001', actual: true, activo: true,
    } as any);

    const res = await request(app)
      .put('/api/plan-estudios/a0000000-0000-4000-8000-000000000001/activar')
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(409);
  });

  it('debe retornar 403 para director', async () => {
    const res = await request(app)
      .put('/api/plan-estudios/a0000000-0000-4000-8000-000000000001/activar')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(403);
  });
});
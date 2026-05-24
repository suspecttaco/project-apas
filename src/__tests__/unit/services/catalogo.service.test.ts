import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockPrisma } from '../../mocks/prisma.mock';
import { GradoService } from '../../../modules/grado/grado.service';
import { MateriaService } from '../../../modules/materia/materia.service';
import { NombramientoService } from '../../../modules/nombramiento/nombramiento.service';
import { RolEmpleadoService } from '../../../modules/rol-empleado/rol-empleado.service';
import { PlanEstudiosService } from '../../../modules/plan-estudios/plan-estudios.service';
import { NotFoundError, ConflictError } from '../../../lib/errors';
import { mockReset } from 'vitest-mock-extended';

beforeEach(() => {
  mockReset(mockPrisma);
});

// ─── GradoService ────────────────────────────────────────────────────────────

describe('GradoService.create', () => {
  const planNoActual = { id: 'uuid-plan', activo: true, actual: false };
  const planActual   = { id: 'uuid-plan', activo: true, actual: true  };

  it('debe crear un grado si el plan no es actual', async () => {
    mockPrisma.planEstudios.findFirst.mockResolvedValue(planNoActual as any);
    mockPrisma.grado.findFirst.mockResolvedValue(null);
    mockPrisma.grado.create.mockResolvedValue({
      id: 'uuid-grado', idPlan: 'uuid-plan', nombre: 'Primer Grado',
      numero: 1, activo: true, fCre: new Date(), fMod: new Date(),
    });

    const result = await GradoService.create({ idPlan: 'uuid-plan', nombre: 'Primer Grado', numero: 1 });
    expect(result.numero).toBe(1);
  });

  it('debe lanzar ConflictError si el plan es actual', async () => {
    mockPrisma.planEstudios.findFirst.mockResolvedValue(planActual as any);

    await expect(
      GradoService.create({ idPlan: 'uuid-plan', nombre: 'Primer Grado', numero: 1 })
    ).rejects.toThrow(ConflictError);
  });

  it('debe lanzar NotFoundError si el plan no existe', async () => {
    mockPrisma.planEstudios.findFirst.mockResolvedValue(null);

    await expect(
      GradoService.create({ idPlan: 'uuid-inexistente', nombre: 'Primer Grado', numero: 1 })
    ).rejects.toThrow(NotFoundError);
  });

  it('debe lanzar ConflictError si ya existe ese numero en el plan', async () => {
    mockPrisma.planEstudios.findFirst.mockResolvedValue(planNoActual as any);
    mockPrisma.grado.findFirst.mockResolvedValue({ id: 'uuid-grado-existente' } as any);

    await expect(
      GradoService.create({ idPlan: 'uuid-plan', nombre: 'Primer Grado', numero: 1 })
    ).rejects.toThrow(ConflictError);
  });
});

describe('GradoService.update', () => {
  const gradoBase = {
    id: 'uuid-grado', idPlan: 'uuid-plan', nombre: 'Primer Grado',
    numero: 1, activo: true, fCre: new Date(), fMod: new Date(),
  };

  it('debe actualizar el nombre aunque el plan sea actual', async () => {
    mockPrisma.grado.findFirst.mockResolvedValue(gradoBase);
    mockPrisma.grado.update.mockResolvedValue({ ...gradoBase, nombre: 'Primer Grado Actualizado' });

    const result = await GradoService.update('uuid-grado', { nombre: 'Primer Grado Actualizado' });
    expect(result.nombre).toBe('Primer Grado Actualizado');
  });

  it('debe lanzar NotFoundError si no existe', async () => {
    mockPrisma.grado.findFirst.mockResolvedValue(null);

    await expect(
      GradoService.update('uuid-inexistente', { nombre: 'X' })
    ).rejects.toThrow(NotFoundError);
  });
});

describe('GradoService.softDelete', () => {
  const gradoBase = {
    id: 'uuid-grado', idPlan: 'uuid-plan', nombre: 'Primer Grado',
    numero: 1, activo: true, fCre: new Date(), fMod: new Date(),
  };

  it('debe desactivar grado si el plan no es actual', async () => {
    mockPrisma.grado.findFirst.mockResolvedValue(gradoBase);
    mockPrisma.planEstudios.findFirst.mockResolvedValue({ id: 'uuid-plan', actual: false } as any);
    mockPrisma.grado.update.mockResolvedValue({ ...gradoBase, activo: false });

    const result = await GradoService.softDelete('uuid-grado');
    expect(result.activo).toBe(false);
  });

  it('debe lanzar ConflictError si el plan es actual', async () => {
    mockPrisma.grado.findFirst.mockResolvedValue(gradoBase);
    mockPrisma.planEstudios.findFirst.mockResolvedValue({ id: 'uuid-plan', actual: true } as any);

    await expect(
      GradoService.softDelete('uuid-grado')
    ).rejects.toThrow(ConflictError);
  });
});

// ─── MateriaService ──────────────────────────────────────────────────────────

describe('MateriaService.create', () => {
  const planNoActual = { id: 'uuid-plan', activo: true, actual: false };
  const planActual   = { id: 'uuid-plan', activo: true, actual: true  };

  it('debe crear una materia si el plan no es actual', async () => {
    mockPrisma.planEstudios.findFirst.mockResolvedValue(planNoActual as any);
    mockPrisma.materia.findFirst.mockResolvedValue(null);
    mockPrisma.materia.create.mockResolvedValue({
      id: 'uuid-materia', idPlan: 'uuid-plan', nombre: 'Matematicas',
      desc: null, activo: true, fCre: new Date(), fMod: new Date(),
    });

    const result = await MateriaService.create({ idPlan: 'uuid-plan', nombre: 'Matematicas' });
    expect(result.nombre).toBe('Matematicas');
  });

  it('debe lanzar ConflictError si el plan es actual', async () => {
    mockPrisma.planEstudios.findFirst.mockResolvedValue(planActual as any);

    await expect(
      MateriaService.create({ idPlan: 'uuid-plan', nombre: 'Matematicas' })
    ).rejects.toThrow(ConflictError);
  });

  it('debe lanzar NotFoundError si el plan no existe', async () => {
    mockPrisma.planEstudios.findFirst.mockResolvedValue(null);

    await expect(
      MateriaService.create({ idPlan: 'uuid-inexistente', nombre: 'Matematicas' })
    ).rejects.toThrow(NotFoundError);
  });

  it('debe lanzar ConflictError si ya existe esa materia en el plan', async () => {
    mockPrisma.planEstudios.findFirst.mockResolvedValue(planNoActual as any);
    mockPrisma.materia.findFirst.mockResolvedValue({ id: 'uuid-mat-existente' } as any);

    await expect(
      MateriaService.create({ idPlan: 'uuid-plan', nombre: 'Matematicas' })
    ).rejects.toThrow(ConflictError);
  });
});

describe('MateriaService.update', () => {
  const materiaBase = {
    id: 'uuid-materia', idPlan: 'uuid-plan', nombre: 'Matematicas',
    desc: null, activo: true, fCre: new Date(), fMod: new Date(),
  };

  it('debe actualizar el nombre aunque el plan sea actual', async () => {
    mockPrisma.materia.findFirst
      .mockResolvedValueOnce(materiaBase)
      .mockResolvedValueOnce(null);
    mockPrisma.materia.update.mockResolvedValue({ ...materiaBase, nombre: 'Matematicas Avanzadas' });

    const result = await MateriaService.update('uuid-materia', { nombre: 'Matematicas Avanzadas' });
    expect(result.nombre).toBe('Matematicas Avanzadas');
  });

  it('debe lanzar ConflictError si el nuevo nombre ya existe en el plan', async () => {
    mockPrisma.materia.findFirst
      .mockResolvedValueOnce(materiaBase)
      .mockResolvedValueOnce({ id: 'uuid-otra-materia' } as any);

    await expect(
      MateriaService.update('uuid-materia', { nombre: 'Fisica' })
    ).rejects.toThrow(ConflictError);
  });

  it('debe lanzar NotFoundError si no existe', async () => {
    mockPrisma.materia.findFirst.mockResolvedValue(null);

    await expect(
      MateriaService.update('uuid-inexistente', { nombre: 'X' })
    ).rejects.toThrow(NotFoundError);
  });
});

describe('MateriaService.softDelete', () => {
  const materiaBase = {
    id: 'uuid-materia', idPlan: 'uuid-plan', nombre: 'Matematicas',
    desc: null, activo: true, fCre: new Date(), fMod: new Date(),
  };

  it('debe desactivar materia si el plan no es actual', async () => {
    mockPrisma.materia.findFirst.mockResolvedValue(materiaBase);
    mockPrisma.planEstudios.findFirst.mockResolvedValue({ id: 'uuid-plan', actual: false } as any);
    mockPrisma.materia.update.mockResolvedValue({ ...materiaBase, activo: false });

    const result = await MateriaService.softDelete('uuid-materia');
    expect(result.activo).toBe(false);
  });

  it('debe lanzar ConflictError si el plan es actual', async () => {
    mockPrisma.materia.findFirst.mockResolvedValue(materiaBase);
    mockPrisma.planEstudios.findFirst.mockResolvedValue({ id: 'uuid-plan', actual: true } as any);

    await expect(
      MateriaService.softDelete('uuid-materia')
    ).rejects.toThrow(ConflictError);
  });
});

// ─── NombramientoService ─────────────────────────────────────────────────────

describe('NombramientoService.create', () => {
  it('debe crear un nombramiento', async () => {
    mockPrisma.nombramiento.findFirst.mockResolvedValue(null);
    mockPrisma.nombramiento.create.mockResolvedValue({
      id: 'uuid-nom', nombre: 'Profesor de Telesecundaria',
      activo: true, fCre: new Date(), fMod: new Date(),
    });

    const result = await NombramientoService.create({ nombre: 'Profesor de Telesecundaria' });
    expect(result.nombre).toBe('Profesor de Telesecundaria');
  });

  it('debe lanzar ConflictError si el nombre ya existe', async () => {
    mockPrisma.nombramiento.findFirst.mockResolvedValue({ id: 'uuid-nom' } as any);

    await expect(
      NombramientoService.create({ nombre: 'Profesor de Telesecundaria' })
    ).rejects.toThrow(ConflictError);
  });
});

describe('NombramientoService.update', () => {
  const nomBase = {
    id: 'uuid-nom', nombre: 'Profesor de Telesecundaria',
    activo: true, fCre: new Date(), fMod: new Date(),
  };

  it('debe actualizar un nombramiento', async () => {
    mockPrisma.nombramiento.findFirst
      .mockResolvedValueOnce(nomBase)
      .mockResolvedValueOnce(null);
    mockPrisma.nombramiento.update.mockResolvedValue({ ...nomBase, nombre: 'Profesor Actualizado' });

    const result = await NombramientoService.update('uuid-nom', { nombre: 'Profesor Actualizado' });
    expect(result.nombre).toBe('Profesor Actualizado');
  });

  it('debe lanzar ConflictError si el nuevo nombre ya existe', async () => {
    mockPrisma.nombramiento.findFirst
      .mockResolvedValueOnce(nomBase)
      .mockResolvedValueOnce({ id: 'uuid-otro' } as any);

    await expect(
      NombramientoService.update('uuid-nom', { nombre: 'Otro Nombre' })
    ).rejects.toThrow(ConflictError);
  });

  it('debe lanzar NotFoundError si no existe', async () => {
    mockPrisma.nombramiento.findFirst.mockResolvedValue(null);

    await expect(
      NombramientoService.update('uuid-inexistente', { nombre: 'X' })
    ).rejects.toThrow(NotFoundError);
  });
});

describe('NombramientoService.softDelete', () => {
  it('debe desactivar un nombramiento', async () => {
    const nomBase = {
      id: 'uuid-nom', nombre: 'Profesor de Telesecundaria',
      activo: true, fCre: new Date(), fMod: new Date(),
    };
    mockPrisma.nombramiento.findFirst.mockResolvedValue(nomBase);
    mockPrisma.nombramiento.update.mockResolvedValue({ ...nomBase, activo: false });

    const result = await NombramientoService.softDelete('uuid-nom');
    expect(result.activo).toBe(false);
  });

  it('debe lanzar NotFoundError si no existe', async () => {
    mockPrisma.nombramiento.findFirst.mockResolvedValue(null);

    await expect(
      NombramientoService.softDelete('uuid-inexistente')
    ).rejects.toThrow(NotFoundError);
  });
});

// ─── RolEmpleadoService ──────────────────────────────────────────────────────

describe('RolEmpleadoService.create', () => {
  it('debe crear un rol de empleado', async () => {
    mockPrisma.rolEmpleado.findFirst.mockResolvedValue(null);
    mockPrisma.rolEmpleado.create.mockResolvedValue({
      id: 'uuid-rol', nombre: 'Coordinador', desc: null,
      activo: true, fCre: new Date(), fMod: new Date(),
    });

    const result = await RolEmpleadoService.create({ nombre: 'Coordinador' });
    expect(result.nombre).toBe('Coordinador');
  });

  it('debe lanzar ConflictError si el nombre ya existe', async () => {
    mockPrisma.rolEmpleado.findFirst.mockResolvedValue({ id: 'uuid-rol' } as any);

    await expect(
      RolEmpleadoService.create({ nombre: 'Coordinador' })
    ).rejects.toThrow(ConflictError);
  });
});

describe('RolEmpleadoService.update', () => {
  const rolBase = {
    id: 'uuid-rol', nombre: 'Coordinador', desc: null,
    activo: true, fCre: new Date(), fMod: new Date(),
  };

  it('debe actualizar un rol de empleado', async () => {
    mockPrisma.rolEmpleado.findFirst
      .mockResolvedValueOnce(rolBase)
      .mockResolvedValueOnce(null);
    mockPrisma.rolEmpleado.update.mockResolvedValue({ ...rolBase, nombre: 'Subdirector' });

    const result = await RolEmpleadoService.update('uuid-rol', { nombre: 'Subdirector' });
    expect(result.nombre).toBe('Subdirector');
  });

  it('debe lanzar ConflictError si el nuevo nombre ya existe', async () => {
    mockPrisma.rolEmpleado.findFirst
      .mockResolvedValueOnce(rolBase)
      .mockResolvedValueOnce({ id: 'uuid-otro' } as any);

    await expect(
      RolEmpleadoService.update('uuid-rol', { nombre: 'Docente' })
    ).rejects.toThrow(ConflictError);
  });

  it('debe lanzar NotFoundError si no existe', async () => {
    mockPrisma.rolEmpleado.findFirst.mockResolvedValue(null);

    await expect(
      RolEmpleadoService.update('uuid-inexistente', { nombre: 'X' })
    ).rejects.toThrow(NotFoundError);
  });
});

describe('RolEmpleadoService.softDelete', () => {
  it('debe desactivar un rol de empleado', async () => {
    const rolBase = {
      id: 'uuid-rol', nombre: 'Coordinador', desc: null,
      activo: true, fCre: new Date(), fMod: new Date(),
    };
    mockPrisma.rolEmpleado.findFirst.mockResolvedValue(rolBase);
    mockPrisma.rolEmpleado.update.mockResolvedValue({ ...rolBase, activo: false });

    const result = await RolEmpleadoService.softDelete('uuid-rol');
    expect(result.activo).toBe(false);
  });

  it('debe lanzar NotFoundError si no existe', async () => {
    mockPrisma.rolEmpleado.findFirst.mockResolvedValue(null);

    await expect(
      RolEmpleadoService.softDelete('uuid-inexistente')
    ).rejects.toThrow(NotFoundError);
  });
});

// ─── PlanEstudiosService escritura ───────────────────────────────────────────

describe('PlanEstudiosService.create', () => {
  it('debe crear un plan con grados y materias en transaccion', async () => {
    const planMock = {
      id: 'uuid-plan', nombre: 'Plan Nuevo', desc: null,
      actual: false, activo: true, fCre: new Date(), fMod: new Date(),
    };
    mockPrisma.planEstudios.findFirst.mockResolvedValue(null);
    mockPrisma.$transaction.mockImplementation(async (cb: any) => cb({
      planEstudios: { create: vi.fn().mockResolvedValue(planMock), findFirst: vi.fn().mockResolvedValue(planMock) },
      grado:        { create: vi.fn().mockResolvedValue({}) },
      materia:      { create: vi.fn().mockResolvedValue({}) },
    }));

    const result = await PlanEstudiosService.create({
      nombre: 'Plan Nuevo',
      grados: [{ nombre: 'Primer Grado', numero: 1 }],
      materias: [{ nombre: 'Matematicas' }],
    });
    expect(result).toBeDefined();
  });

  it('debe lanzar ConflictError si el nombre ya existe', async () => {
    mockPrisma.planEstudios.findFirst.mockResolvedValue({ id: 'uuid-plan' } as any);

    await expect(
      PlanEstudiosService.create({ nombre: 'Plan Existente', grados: [], materias: [] })
    ).rejects.toThrow(ConflictError);
  });
});

describe('PlanEstudiosService.update', () => {
  const planBase = {
    id: 'uuid-plan', nombre: 'Plan 2017', desc: null,
    actual: false, activo: true, fCre: new Date(), fMod: new Date(),
    grados: [], materias: [],
  };

  it('debe actualizar nombre y desc del plan', async () => {
    mockPrisma.planEstudios.findFirst
      .mockResolvedValueOnce(planBase as any)  // getById
      .mockResolvedValueOnce(null);            // check nombre duplicado
    mockPrisma.planEstudios.update.mockResolvedValue({ ...planBase, nombre: 'Plan 2020' } as any);

    const result = await PlanEstudiosService.update('uuid-plan', { nombre: 'Plan 2020' });
    expect(result.nombre).toBe('Plan 2020');
  });

  it('debe lanzar NotFoundError si no existe', async () => {
    mockPrisma.planEstudios.findFirst.mockResolvedValue(null);

    await expect(
      PlanEstudiosService.update('uuid-inexistente', { nombre: 'X' })
    ).rejects.toThrow(NotFoundError);
  });
});

describe('PlanEstudiosService.softDelete', () => {
  it('debe desactivar el plan si no es actual y no tiene ciclos', async () => {
    mockPrisma.planEstudios.findFirst.mockResolvedValue({
      id: 'uuid-plan', actual: false, activo: true, grados: [], materias: [],
    } as any);
    mockPrisma.ciclo.findFirst.mockResolvedValue(null);
    mockPrisma.planEstudios.update.mockResolvedValue({
      id: 'uuid-plan', activo: false,
    } as any);

    const result = await PlanEstudiosService.softDelete('uuid-plan');
    expect(result.activo).toBe(false);
  });

  it('debe lanzar ConflictError si el plan es actual', async () => {
    mockPrisma.planEstudios.findFirst.mockResolvedValue({
      id: 'uuid-plan', actual: true, activo: true, grados: [], materias: [],
    } as any);

    await expect(
      PlanEstudiosService.softDelete('uuid-plan')
    ).rejects.toThrow(ConflictError);
  });

  it('debe lanzar ConflictError si tiene ciclos asociados', async () => {
    mockPrisma.planEstudios.findFirst.mockResolvedValue({
      id: 'uuid-plan', actual: false, activo: true, grados: [], materias: [],
    } as any);
    mockPrisma.ciclo.findFirst.mockResolvedValue({ id: 'uuid-ciclo' } as any);

    await expect(
      PlanEstudiosService.softDelete('uuid-plan')
    ).rejects.toThrow(ConflictError);
  });
});

describe('PlanEstudiosService.activar', () => {
  it('debe marcar el plan como actual y desmarcar el anterior', async () => {
    const planActualizado = { id: 'uuid-plan', actual: true, activo: true, grados: [], materias: [] };
    mockPrisma.planEstudios.findFirst
      .mockResolvedValueOnce({ id: 'uuid-plan', actual: false, activo: true, grados: [], materias: [] } as any)
      .mockResolvedValueOnce(planActualizado as any);
    mockPrisma.$transaction.mockImplementation(async (cb: any) => cb({
      planEstudios: {
        updateMany: vi.fn().mockResolvedValue({}),
        update:     vi.fn().mockResolvedValue(planActualizado),
      },
    }));

    const result = await PlanEstudiosService.activar('uuid-plan');
    expect(result).toBeDefined();
  });

  it('debe lanzar ConflictError si ya es el plan actual', async () => {
    mockPrisma.planEstudios.findFirst.mockResolvedValue({
      id: 'uuid-plan', actual: true, activo: true, grados: [], materias: [],
    } as any);

    await expect(
      PlanEstudiosService.activar('uuid-plan')
    ).rejects.toThrow(ConflictError);
  });

  it('debe lanzar NotFoundError si no existe', async () => {
    mockPrisma.planEstudios.findFirst.mockResolvedValue(null);

    await expect(
      PlanEstudiosService.activar('uuid-inexistente')
    ).rejects.toThrow(NotFoundError);
  });
});
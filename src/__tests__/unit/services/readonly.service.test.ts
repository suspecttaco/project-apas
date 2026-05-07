import { describe, it, expect, beforeEach } from 'vitest';
import { mockPrisma } from '../../mocks/prisma.mock';
import { PlanEstudiosService } from '../../../modules/plan-estudios/plan-estudios.service';
import { GradoService } from '../../../modules/grado/grado.service';
import { MateriaService } from '../../../modules/materia/materia.service';
import { NombramientoService } from '../../../modules/nombramiento/nombramiento.service';
import { RolEmpleadoService } from '../../../modules/rol-empleado/rol-empleado.service';
import { NotFoundError } from '../../../lib/errors';
import { mockReset } from 'vitest-mock-extended';

beforeEach(() => {
  mockReset(mockPrisma);
});

//  PlanEstudios 

describe('PlanEstudiosService', () => {
  const planBase = {
    id: 'uuid-plan', nombre: 'Plan 2017', desc: null,
    activo: true, fCre: new Date(), fMod: new Date(),
  };

  it('getAll debe retornar lista de planes', async () => {
    mockPrisma.planEstudios.findMany.mockResolvedValue([planBase]);
    const result = await PlanEstudiosService.getAll();
    expect(result).toHaveLength(1);
  });

  it('getById debe retornar el plan si existe', async () => {
    mockPrisma.planEstudios.findFirst.mockResolvedValue({
      ...planBase, grados: [], materias: [],
    } as any);
    const result = await PlanEstudiosService.getById('uuid-plan');
    expect(result.id).toBe('uuid-plan');
  });

  it('getById debe lanzar NotFoundError si no existe', async () => {
    mockPrisma.planEstudios.findFirst.mockResolvedValue(null);
    await expect(
      PlanEstudiosService.getById('uuid-inexistente')
    ).rejects.toThrow(NotFoundError);
  });
});

//  Grado 

describe('GradoService', () => {
  const gradoBase = {
    id: 'uuid-grado', idPlan: 'uuid-plan', nombre: 'Primer Grado',
    numero: 1, activo: true, fCre: new Date(), fMod: new Date(),
  };

  it('getAll debe retornar lista de grados', async () => {
    mockPrisma.grado.findMany.mockResolvedValue([gradoBase]);
    const result = await GradoService.getAll();
    expect(result).toHaveLength(1);
  });

  it('getById debe retornar el grado si existe', async () => {
    mockPrisma.grado.findFirst.mockResolvedValue(gradoBase);
    const result = await GradoService.getById('uuid-grado');
    expect(result.numero).toBe(1);
  });

  it('getById debe lanzar NotFoundError si no existe', async () => {
    mockPrisma.grado.findFirst.mockResolvedValue(null);
    await expect(
      GradoService.getById('uuid-inexistente')
    ).rejects.toThrow(NotFoundError);
  });
});

//  Materia

describe('MateriaService', () => {
  const materiaBase = {
    id: 'uuid-materia', idPlan: 'uuid-plan', nombre: 'Matematicas',
    desc: null, activo: true, fCre: new Date(), fMod: new Date(),
  };

  it('getAll debe retornar lista de materias', async () => {
    mockPrisma.materia.findMany.mockResolvedValue([materiaBase]);
    const result = await MateriaService.getAll();
    expect(result).toHaveLength(1);
  });

  it('getById debe retornar la materia si existe', async () => {
    mockPrisma.materia.findFirst.mockResolvedValue(materiaBase);
    const result = await MateriaService.getById('uuid-materia');
    expect(result.nombre).toBe('Matematicas');
  });

  it('getById debe lanzar NotFoundError si no existe', async () => {
    mockPrisma.materia.findFirst.mockResolvedValue(null);
    await expect(
      MateriaService.getById('uuid-inexistente')
    ).rejects.toThrow(NotFoundError);
  });
});

//  Nombramiento 

describe('NombramientoService', () => {
  const nombramientoBase = {
    id: 'uuid-nombramiento', nombre: 'Profesor de Educacion Secundaria',
    activo: true, fCre: new Date(), fMod: new Date(),
  };

  it('getAll debe retornar lista de nombramientos', async () => {
    mockPrisma.nombramiento.findMany.mockResolvedValue([nombramientoBase]);
    const result = await NombramientoService.getAll();
    expect(result).toHaveLength(1);
  });

  it('getById debe retornar el nombramiento si existe', async () => {
    mockPrisma.nombramiento.findFirst.mockResolvedValue(nombramientoBase);
    const result = await NombramientoService.getById('uuid-nombramiento');
    expect(result.nombre).toBe('Profesor de Educacion Secundaria');
  });

  it('getById debe lanzar NotFoundError si no existe', async () => {
    mockPrisma.nombramiento.findFirst.mockResolvedValue(null);
    await expect(
      NombramientoService.getById('uuid-inexistente')
    ).rejects.toThrow(NotFoundError);
  });
});

//  RolEmpleado 

describe('RolEmpleadoService', () => {
  const rolBase = {
    id: 'uuid-rol', nombre: 'Docente', desc: null,
    activo: true, fCre: new Date(), fMod: new Date(),
  };

  it('getAll debe retornar lista de roles', async () => {
    mockPrisma.rolEmpleado.findMany.mockResolvedValue([rolBase]);
    const result = await RolEmpleadoService.getAll();
    expect(result).toHaveLength(1);
  });

  it('getById debe retornar el rol si existe', async () => {
    mockPrisma.rolEmpleado.findFirst.mockResolvedValue(rolBase);
    const result = await RolEmpleadoService.getById('uuid-rol');
    expect(result.nombre).toBe('Docente');
  });

  it('getById debe lanzar NotFoundError si no existe', async () => {
    mockPrisma.rolEmpleado.findFirst.mockResolvedValue(null);
    await expect(
      RolEmpleadoService.getById('uuid-inexistente')
    ).rejects.toThrow(NotFoundError);
  });
});
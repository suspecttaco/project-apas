import { Prisma } from '@prisma/client';

export const empleadoInclude = {
  persona:    { include: { direccion: true, contacto: true } },
  preparacion: true,
  roles:      { where: { activo: true }, include: { rol: true } },
  plazas:     {
    where:   { activo: true },
    include: {
      nombramiento: true,
      materia:      true,
      grupos:       { include: { grupo: { include: { grado: true } } } },
    },
  },
  trabajoExterno: { where: { activo: true } },
  horarioSlots:   {
    where:   { activo: true },
    include: { grupo: { include: { grado: true } }, materia: true },
  },
} as const;

export const grupoInclude = {
  grado: true,
  turno: true,
  horarioSlots: {
    where:   { activo: true },
    include: { empleado: { include: { persona: true } }, materia: true },
  },
  estadisticas: true,
} as const;

export type EmpleadoCompleto = Prisma.EmpleadoGetPayload<{ include: typeof empleadoInclude }>;
export type GrupoCompleto    = Prisma.GrupoGetPayload<{ include: typeof grupoInclude }>;

export type EscuelaConTurnos = Prisma.EscuelaGetPayload<{
  include: { turnos: true }
}>;

export type CicloConPlan = Prisma.CicloGetPayload<{
  include: { plan: { include: { materias: true; grados: true } } }
}>;

export type RolSimple = Prisma.RolEmpleadoGetPayload<Record<string, never>>;

export interface DatosPadron {
  escuela:   EscuelaConTurnos;
  ciclo:     CicloConPlan;
  empleados: EmpleadoCompleto[];
  grupos:    GrupoCompleto[];
  roles:     RolSimple[];
}

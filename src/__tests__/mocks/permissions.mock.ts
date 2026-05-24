import { vi } from 'vitest';

// UUIDs fijos para roles en tests -- deben ser v4 validos
export const UUID_ROL_ADMIN      = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
export const UUID_ROL_SUPERVISOR = 'f47ac10b-58cc-4372-a567-0e02b2c3d480';
export const UUID_ROL_DIRECTOR   = 'f47ac10b-58cc-4372-a567-0e02b2c3d481';

// Permisos reales por rol -- refleja lo definido en el seed
const PERMISOS_POR_ROL: Record<string, Set<string>> = {
  [UUID_ROL_ADMIN]: new Set([
    'roles:read', 'roles:write',
    'permisos:read', 'permisos:write',
    'usuarios:read', 'usuarios:write',
    'escuelas:read', 'escuelas:write',
    'directores:read', 'directores:write',
    'empleados:read', 'empleados:write',
    'ciclos:read', 'ciclos:write',
    'turnos:read', 'turnos:write',
    'grupos:read', 'grupos:write',
    'plazas:read', 'plazas:write',
    'horarios:read', 'horarios:write',
    'coberturas:read', 'coberturas:write',
    'estadisticas:read', 'estadisticas:write',
    'padron:read', 'padron:generate',
    'catalogos:read',
  ]),
  [UUID_ROL_SUPERVISOR]: new Set([
    'escuelas:read', 'escuelas:write',
    'directores:read', 'directores:write',
    'empleados:read', 'empleados:write',
    'ciclos:read', 'ciclos:write',
    'turnos:read', 'turnos:write',
    'grupos:read', 'grupos:write',
    'plazas:read', 'plazas:write',
    'horarios:read', 'horarios:write',
    'coberturas:read', 'coberturas:write',
    'estadisticas:read', 'estadisticas:write',
    'padron:read', 'padron:generate',
    'catalogos:read',
  ]),
  [UUID_ROL_DIRECTOR]: new Set([
    'empleados:read', 'empleados:write',
    'ciclos:read', 'ciclos:write',
    'turnos:read', 'turnos:write',
    'grupos:read', 'grupos:write',
    'plazas:read', 'plazas:write',
    'horarios:read', 'horarios:write',
    'coberturas:read', 'coberturas:write',
    'estadisticas:read', 'estadisticas:write',
    'padron:read', 'padron:generate',
    'catalogos:read',
  ]),
};

// Mock del modulo permissions -- usa los permisos reales por rol
vi.mock('../../lib/permissions', () => ({
  tienePermiso:   (idRol: string, permiso: string) => PERMISOS_POR_ROL[idRol]?.has(permiso) ?? false,
  cargarPermisos: vi.fn().mockResolvedValue(undefined),
}));
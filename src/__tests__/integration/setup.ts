import jwt from 'jsonwebtoken';
import { UUID_ROL_ADMIN, UUID_ROL_SUPERVISOR, UUID_ROL_DIRECTOR } from '../mocks/permissions.mock';
import { mockPrisma } from '../mocks/prisma.mock';

export const UUID_ESC = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

const usuarioAdmin = {
  id:     'uuid-admin',
  idRol:  UUID_ROL_ADMIN,
  idEsc:  null,
  activo: true,
  fCre:   new Date(),
  fMod:   new Date(),
};

const usuarioSupervisor = {
  id:     'uuid-supervisor',
  idRol:  UUID_ROL_SUPERVISOR,
  idEsc:  null,
  activo: true,
  fCre:   new Date(),
  fMod:   new Date(),
};

const usuarioDirector = (idEsc: string) => ({
  id:     'uuid-director',
  idRol:  UUID_ROL_DIRECTOR,
  idEsc,
  activo: true,
  fCre:   new Date(),
  fMod:   new Date(),
});

// mockResolvedValueOnce para que el middleware consuma solo la primera llamada
// y las siguientes llamadas de usuario.findFirst en los servicios usen su propio mock

export function tokenAdmin(): string {
  mockPrisma.usuario.findFirst.mockResolvedValueOnce(usuarioAdmin as any);
  return jwt.sign(
    { id: 'uuid-admin', idRol: UUID_ROL_ADMIN },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );
}

export function tokenSupervisor(): string {
  mockPrisma.usuario.findFirst.mockResolvedValueOnce(usuarioSupervisor as any);
  return jwt.sign(
    { id: 'uuid-supervisor', idRol: UUID_ROL_SUPERVISOR },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );
}

export function tokenDirector(idEsc = UUID_ESC): string {
  mockPrisma.usuario.findFirst.mockResolvedValueOnce(usuarioDirector(idEsc) as any);
  return jwt.sign(
    { id: 'uuid-director', idRol: UUID_ROL_DIRECTOR, idEsc },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );
}

export function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}
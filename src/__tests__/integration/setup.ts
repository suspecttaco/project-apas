import jwt from 'jsonwebtoken';
import { UUID_ROL_ADMIN, UUID_ROL_SUPERVISOR, UUID_ROL_DIRECTOR } from '../mocks/permissions.mock';

// UUID de escuela fijo para tests
export const UUID_ESC = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

export function tokenAdmin(): string {
  return jwt.sign(
    { id: 'uuid-admin', idRol: UUID_ROL_ADMIN },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );
}

export function tokenSupervisor(): string {
  return jwt.sign(
    { id: 'uuid-supervisor', idRol: UUID_ROL_SUPERVISOR },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );
}

export function tokenDirector(idEsc = UUID_ESC): string {
  return jwt.sign(
    { id: 'uuid-director', idRol: UUID_ROL_DIRECTOR, idEsc },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );
}

export function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}
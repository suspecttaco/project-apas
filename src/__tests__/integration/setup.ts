import { mockPrisma } from '../mocks/prisma.mock';
import { mockReset } from 'vitest-mock-extended';
import jwt from 'jsonwebtoken';

export function tokenSupervisor(): string {
  return jwt.sign(
    { id: 'uuid-admin', rol: 'admin' },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );
}

export function tokenDirector(idEsc = 'uuid-escuela'): string {
  return jwt.sign(
    { id: 'uuid-director', rol: 'director', idEsc },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );
}

export function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

beforeEach(() => {
  mockReset(mockPrisma);
});
import { mockDeep, mockReset, DeepMockProxy } from 'vitest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { vi } from 'vitest';
import { beforeEach } from 'node:test';

// Importar mock de permissions antes que cualquier modulo que use rbac
import './permissions.mock';

vi.mock('../../lib/db', () => ({
  db:       mockPrisma,
  whereEsc: (idEsc: string) => ({ idEsc, activo: true }),
}));

export const mockPrisma = mockDeep<PrismaClient>();

beforeEach(() => {
  mockReset(mockPrisma);
});
import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';
import path from 'path';

const env = loadEnv('test', process.cwd(), '');

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals:     true,
    environment: 'node',
    env,
    setupFiles:  ['./src/__tests__/mocks/prisma.mock.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include:  ['src/**/*.ts'],
      exclude:  ['src/**/*.schema.ts', 'src/index.ts'],
    },
  },
});
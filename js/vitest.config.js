import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', ['text', { file: 'coverage.txt' }]],
      include: ['src/**/*.js'],
      all: true,
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },
    reporters: ['verbose'],
  },
});

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: [['text', { file: 'coverage.txt' }], 'json', 'html', 'lcov'],
      include: ['src/**/*.js'],
      exclude: [
        'node_modules/**',
        'test/**',
        'perf/**',
        '**/*.test.js',
        '**/*.spec.js',
      ],
      all: true,
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },
    reporters: ['verbose'],
  },
});

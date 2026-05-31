import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    // WHY globals? Allows using describe, it, expect without imports (like Jest)
    globals: true,

    // WHY jsdom? React components need a DOM environment to render
    environment: 'jsdom',

    // WHY setupFiles? Configures testing-library matchers and cleanup
    setupFiles: ['./src/__tests__/setup.js'],

    // WHY include pattern? Only run test files, not source files
    include: ['src/**/*.{test,spec}.{js,jsx}'],

    // WHY exclude node_modules? Don't test dependencies
    exclude: ['node_modules', 'dist'],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'src/__tests__/',
        '**/*.d.ts',
        'src/main.jsx',
        'vite.config.js',
        'vitest.config.js',
      ],
      // WHY thresholds? Ensure minimum test coverage
      thresholds: {
        lines: 50,
        functions: 50,
        branches: 50,
        statements: 50,
      },
    },
  },
});

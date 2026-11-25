/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Bazowa ścieżka aplikacji. Na GitHub Pages strona działa pod `/<nazwa-repo>/`,
 * dlatego workflow wdrożeniowy ustawia zmienną `BASE_PATH`. Lokalnie używamy `/`.
 */
const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  base,
  plugins: [react()],
  worker: {
    format: 'es',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: [
      'src/**/*.test.{ts,tsx}',
      'tests/**/*.test.{ts,tsx}',
      'scripts/**/*.test.ts',
      'worker/**/*.test.ts',
    ],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}', 'scripts/**/*.ts', 'worker/src/**/*.ts'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'worker/**/*.test.ts',
        'src/main.tsx',
        'src/**/*.d.ts',
        // Worker wymaga prawdziwego Pyodide – testowany przez harness (unittest) i ręcznie.
        'src/python/worker.ts',
        'scripts/build-catalog.ts',
        'scripts/verify-solutions.ts',
        'scripts/verify-basics.ts',
        'scripts/verify-excel.ts',
        // Arkusz rysuje na <canvas> (brak w jsdom) – w testach jest podmieniany.
        'src/components/SpreadsheetWorkbook.tsx',
      ],
      thresholds: { lines: 80, functions: 80, branches: 70, statements: 80 },
    },
  },
});

/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  // @ts-ignore - Version conflit Vite entre principal et Vitest
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/setup.ts'],
    clearMocks: true,
    restoreMocks: true,
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/tests/e2e/**',
      '**/*.e2e.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      '**/playwright.config.ts'
    ],
    include: [
      '**/src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html'],
      reportOnFailure: true,
      exclude: [
        'node_modules/',
        'src/tests/',
        'tests/e2e/',
        '**/*.d.ts',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        'src/main.tsx',
        'src/vite-env.d.ts',
        'dist/',
        'build/',
        'public/'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})

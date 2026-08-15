import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// Mirrors the backend's vitest.config.mts (node environment, src/**/__tests__
// glob) -- this is the frontend equivalent, swapping in jsdom since these
// are component tests, and a components/**/__tests__ glob to match where
// RatingForm/WatchlistButton/ProgressTracker live.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  test: {
    environment: 'jsdom',
    include: ['**/__tests__/**/*.test.{ts,tsx}'],
    exclude: ['node_modules/**', '.next/**'],
    setupFiles: ['./vitest.setup.ts'],
  },
});

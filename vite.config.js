import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
  },
  server: {
    // CRITICAL FIX: This enables SPA routing in the local dev server,
    // ensuring that routes like /admin/setup work correctly during development.
    historyApiFallback: true,
  }
});

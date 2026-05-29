import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Frontend dev server runs on 5173; /api requests are proxied to the
// Express backend on localhost:5000 so the browser never hits CORS.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});

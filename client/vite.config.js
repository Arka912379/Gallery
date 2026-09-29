import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Proxying /api keeps the browser on a single origin in dev, so the auth
// cookie behaves exactly as it will in production (no cross-site cookie issues).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:5000', changeOrigin: true },
    },
  },
});

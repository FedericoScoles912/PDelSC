// ============================================================
// vite.config.js
// Configuración de Vite (ESM): dev server + build
// En desarrollo proxy: /api -> Express (PORT 3001)
// ============================================================
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiBase = env.VITE_API_BASE_URL || 'http://localhost:3001';

  return {
    plugins: [react()],
    // Build de producción a /dist para que Express lo sirva
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
    server: {
      port: 5173,
      proxy: {
        // Redirige las llamadas a la API al servidor Express en desarrollo
        '/api': {
          target: apiBase,
          changeOrigin: true,
        },
      },
    },
    // Permite importar CSS y JSX/JS con rutas relativas
    resolve: {
      extensions: ['.js', '.jsx', '.json'],
    },
  };
});

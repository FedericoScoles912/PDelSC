import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Configuración de Vite (React + ES Modules).
 *
 * El frontend consume la API con la URL absoluta de VITE_API_URL, por lo que
 * no se usa proxy: así se ejercita el CORS restringido del backend y el
 * proyecto es portable tal cual a otro dominio.
 */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: false,
    watch: {
      /**
       * El backend (Express + MySQL) no forma parte del grafo de módulos del
       * frontend. Sin esta exclusión, cada guardado en Server/ o Database/
       * provoca una recarga completa de la página, que aborta las peticiones
       * en vuelo (net::ERR_ABORTED en la consola del navegador).
       */
      ignored: ['**/Server/**', '**/Database/**'],
    },
  },
  preview: {
    port: 4173,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});

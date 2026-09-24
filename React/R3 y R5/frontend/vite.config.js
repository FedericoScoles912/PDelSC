import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@hooks': path.resolve(__dirname, './src/Scripts/hooks'),
      '@context': path.resolve(__dirname, './src/Scripts/context'),
      '@services': path.resolve(__dirname, './src/Scripts/services'),
      '@utils': path.resolve(__dirname, './src/Scripts/utils'),
      '@components': path.resolve(__dirname, './src/Components'),
      '@styles': path.resolve(__dirname, './src/Styles'),
      '@router': path.resolve(__dirname, './src/router-system'),
      '@state': path.resolve(__dirname, './src/state-system'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});

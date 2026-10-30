/**
 * @file Punto de entrada del backend. Arranca el servidor Express, verifica la
 *       conexión con TiDB/MySQL y maneja el apagado ordenado (graceful shutdown).
 * @module server
 */

import { crearApp } from './Server/app.js';
import { cerrarPool, verificarConexion } from './Server/config/db.js';
import { env, validarEntorno } from './Server/config/env.js';

const problemas = validarEntorno();
if (problemas.length) {
  console.warn('[config] Advertencias de entorno:');
  for (const problema of problemas) console.warn('  -', problema);
}

const app = crearApp();

const servidor = app.listen(env.puerto, async () => {
  console.log(`[server] API escuchando en http://localhost:${env.puerto}${env.apiPrefix}`);
  const db = await verificarConexion(3);
  if (db.ok) {
    console.log(`[db] Conectado a la base (${db.version})`);
  } else {
    console.warn(`[db] Sin conexión a la base: ${db.error}`);
  }
});

/**
 * Cierra el servidor HTTP y el pool de la base de forma ordenada.
 * @param {string} senal
 */
async function apagar(senal) {
  console.log(`\n[server] Señal ${senal} recibida: cerrando...`);
  servidor.close(async () => {
    await cerrarPool();
    console.log('[server] Cerrado correctamente.');
    process.exit(0);
  });
  // Fuerza la salida si algo queda colgado.
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on('SIGINT', () => apagar('SIGINT'));
process.on('SIGTERM', () => apagar('SIGTERM'));

export default app;

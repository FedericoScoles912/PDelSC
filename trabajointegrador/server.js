/**
 * @file Punto de entrada del backend. Arranca el servidor Express, verifica la
 *       conexión con TiDB/MySQL y maneja el apagado ordenado (graceful shutdown).
 * @module server
 */

import { crearApp } from './Server/app.js';
import { cerrarPool, ejecutar, verificarConexion } from './Server/config/db.js';
import { env, validarEntorno } from './Server/config/env.js';
import { asegurarColumnaAprobacion } from './Server/servicios/auth.servicio.js';

const problemas = validarEntorno();
if (problemas.length) {
  console.warn('[config] Advertencias de entorno:');
  for (const problema of problemas) console.warn('  -', problema);
}

const app = crearApp();

const servidor = app.listen(env.puerto, '0.0.0.0', async () => {
  console.log(`[server] API escuchando en http://0.0.0.0:${env.puerto}${env.apiPrefix} (LAN: http://10.0.11.139:${env.puerto}${env.apiPrefix})`);
  const db = await verificarConexion(3);
  if (db.ok) {
    console.log(`[db] Conectado a la base (${db.version})`);
    try {
      await asegurarColumnaAprobacion();
      await ejecutar("UPDATE IGNORE `equivalencias` SET `tipo` = 'AJUSA' WHERE `tipo` = 'A'");
      await ejecutar("UPDATE IGNORE `equivalencias` SET `tipo` = 'SABO' WHERE `tipo` = 'S'");
      await ejecutar("DELETE FROM `equivalencias` WHERE `tipo` IN ('A', 'S')");
    } catch (err) {
      console.warn('[db] Advertencia normalizando equivalencias:', err?.message ?? err);
    }
  } else {
    console.warn(`[db] Sin conexión a la base: ${db.error}`);
  }

  // Keep-alive automático para mantener despierto el servicio en Render 24/7
  const urlRender = (process.env.RENDER_EXTERNAL_URL || process.env.KEEP_ALIVE_URL || '').replace(/\/+$/, '');
  if (urlRender) {
    const urlHealth = `${urlRender}${env.apiPrefix}/health`;
    console.log(`[keep-alive] Activado cada 10 min hacia ${urlHealth}`);
    setInterval(async () => {
      try {
        await fetch(urlHealth, { method: 'GET' });
      } catch (err) {
        console.warn('[keep-alive] Error en ping:', err?.message ?? err);
      }
    }, 10 * 60 * 1000).unref();
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

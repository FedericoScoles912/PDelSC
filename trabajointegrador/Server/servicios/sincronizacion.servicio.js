/**
 * @file Servicio de sincronización en tiempo real entre dispositivos (celular ↔ PC).
 *       Calcula una firma determinística e instantánea del estado de la base de datos
 *       en TiDB Cloud (incluyendo checksums CRC32 por fila y contadores) con caché
 *       de corta duración (650ms) e invalidación inmediata ante cualquier mutación.
 * @module Server/servicios/sincronizacion.servicio
 */

import { obtenerNegocioActual, queryUna } from '../config/db.js';
import { obtenerFirmaCarrito } from './carrito.servicio.js';

const cachesPorNegocio = new Map();
const versionMutacionPorNegocio = new Map();

const TTL_CACHE_MS = 650;

/**
 * Invalida inmediatamente la caché de sincronización cuando ocurre un POST/PUT/PATCH/DELETE.
 * @param {string|null} [negocioId]
 */
export function invalidarCacheSincronizacion(negocioId = null) {
  const id = negocioId || obtenerNegocioActual();
  if (id) {
    versionMutacionPorNegocio.set(id, (versionMutacionPorNegocio.get(id) ?? 0) + 1);
    cachesPorNegocio.delete(id);
  } else {
    cachesPorNegocio.clear();
  }
}

/**
 * Obtiene la firma actual del estado de la base de datos para que todos los clientes
 * conectados (celular y computadora) detecten cambios en vivo al instante.
 * @returns {Promise<{firma: string, carritoFirma: string, timestamp: number, negocioId: string}>}
 */
export async function obtenerEstadoSincronizacion() {
  const ahora = Date.now();
  const negocioId = obtenerNegocioActual();
  const cacheFirma = cachesPorNegocio.get(negocioId) || {
    firma: 'inicial',
    carritoFirma: '0:0:0:0:0',
    timestamp: 0,
    calculadoEn: 0
  };

  if (ahora - cacheFirma.calculadoEn < TTL_CACHE_MS && cacheFirma.firma !== 'inicial') {
    return {
      firma: `${negocioId}:${cacheFirma.firma}`,
      carritoFirma: cacheFirma.carritoFirma || '0:0:0:0:0',
      timestamp: cacheFirma.timestamp,
      negocioId
    };
  }

  try {
    const [fila, firmaCarrito] = await Promise.all([
      queryUna(`
      SELECT
        (SELECT COUNT(*) FROM \`productos\`) AS p_cnt,
        (SELECT COALESCE(SUM(\`stock\`), 0) FROM \`productos\`) AS p_stk,
        (SELECT COALESCE(SUM(ROUND(COALESCE(\`precio_lista\`, 0) * 100)), 0) FROM \`productos\`) AS p_prc,
        (SELECT COALESCE(MAX(\`actualizado_en\`), '') FROM \`productos\`) AS p_upd,
        (SELECT COALESCE(BIT_XOR(CRC32(CONCAT_WS('|', \`id\`, \`codigo\`, COALESCE(\`categoria_id\`,0), \`lanzamiento\`, COALESCE(\`eje_texto\`,''), COALESCE(\`aloj_texto\`,''), COALESCE(\`alt_texto\`,''), COALESCE(\`giro\`,''), COALESCE(\`uxb\`,0), COALESCE(\`observaciones\`,''), COALESCE(\`precio_lista\`,0), \`proximo_ingreso\`, \`proximo_embarque\`, \`stock\`, \`stock_minimo\`, \`activo\`))), 0) FROM \`productos\`) AS p_hash,
        (SELECT COUNT(*) FROM \`equivalencias\`) AS eq_cnt,
        (SELECT COALESCE(MAX(\`id\`), 0) FROM \`equivalencias\`) AS eq_max,
        (SELECT COALESCE(BIT_XOR(CRC32(CONCAT_WS('|', \`id\`, \`producto_id\`, \`tipo\`, \`codigo\`))), 0) FROM \`equivalencias\`) AS eq_hash,
        (SELECT COUNT(*) FROM \`categorias\`) AS c_cnt,
        (SELECT COALESCE(SUM(\`activo\`), 0) FROM \`categorias\`) AS c_act,
        (SELECT COALESCE(MAX(\`actualizado_en\`), '') FROM \`categorias\`) AS c_upd,
        (SELECT COALESCE(BIT_XOR(CRC32(CONCAT_WS('|', \`id\`, \`nombre\`, \`slug\`, \`orden\`, \`activo\`))), 0) FROM \`categorias\`) AS c_hash,
        (SELECT COUNT(*) FROM \`movimientos_stock\`) AS m_cnt,
        (SELECT COALESCE(MAX(\`id\`), 0) FROM \`movimientos_stock\`) AS m_max,
        (SELECT COUNT(*) FROM \`historial_precios\`) AS h_cnt,
        (SELECT COALESCE(MAX(\`id\`), 0) FROM \`historial_precios\`) AS h_max,
        (SELECT COUNT(*) FROM \`usuarios\`) AS u_cnt,
        (SELECT COALESCE(SUM(\`activo\`), 0) FROM \`usuarios\`) AS u_act,
        (SELECT COALESCE(MAX(\`actualizado_en\`), '') FROM \`usuarios\`) AS u_upd,
        (SELECT COALESCE(BIT_XOR(CRC32(CONCAT_WS('|', \`id\`, \`rol_id\`, \`email\`, \`nombre\`, COALESCE(\`apellido\`,''), COALESCE(\`telefono\`,''), \`activo\`, COALESCE(\`estado_aprobacion\`,'aprobado')))), 0) FROM \`usuarios\`) AS u_hash,
        (SELECT COALESCE(MAX(\`id\`), 0) FROM \`auditoria\`) AS a_max
    `),
      obtenerFirmaCarrito(negocioId)
    ]);

    const versionNegocio = versionMutacionPorNegocio.get(negocioId) ?? 0;

    const nuevaFirma = fila
      ? [
          fila.p_cnt,
          fila.p_stk,
          fila.p_prc,
          fila.p_upd ? new Date(fila.p_upd).getTime() : 0,
          fila.p_hash,
          fila.eq_cnt,
          fila.eq_max,
          fila.eq_hash,
          fila.c_cnt,
          fila.c_act,
          fila.c_upd ? new Date(fila.c_upd).getTime() : 0,
          fila.c_hash,
          fila.m_cnt,
          fila.m_max,
          fila.h_cnt,
          fila.h_max,
          fila.u_cnt,
          fila.u_act,
          fila.u_upd ? new Date(fila.u_upd).getTime() : 0,
          fila.u_hash,
          fila.a_max,
          `car:${firmaCarrito}`,
          versionNegocio
        ].join(':')
      : `${ahora}:car:${firmaCarrito}:${versionNegocio}`;

    if (nuevaFirma !== cacheFirma.firma) {
      cachesPorNegocio.set(negocioId, {
        firma: nuevaFirma,
        carritoFirma: firmaCarrito,
        timestamp: ahora,
        calculadoEn: ahora
      });
    } else {
      cacheFirma.calculadoEn = ahora;
      cacheFirma.carritoFirma = firmaCarrito;
      cachesPorNegocio.set(negocioId, cacheFirma);
    }
  } catch {
    /* mantener última firma conocida si hay microcorte de red */
  }

  const actual = cachesPorNegocio.get(negocioId) || cacheFirma;
  return {
    firma: `${negocioId}:${actual.firma}`,
    carritoFirma: actual.carritoFirma || '0:0:0:0:0',
    timestamp: actual.timestamp || ahora,
    negocioId
  };
}

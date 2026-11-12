/**
 * @file Servicio de sincronización en tiempo real entre dispositivos (celular ↔ PC).
 *       Calcula una firma ligera del estado de la base de datos en TiDB Cloud con
 *       caché de corta duración (1.2s) e invalidación inmediata ante mutaciones.
 * @module Server/servicios/sincronizacion.servicio
 */

import { queryUna } from '../config/db.js';

let cacheFirma = {
  firma: 'inicial',
  timestamp: 0,
  calculadoEn: 0
};

const TTL_CACHE_MS = 1200;

/**
 * Invalida inmediatamente la caché de sincronización cuando ocurre un POST/PUT/PATCH/DELETE.
 */
export function invalidarCacheSincronizacion() {
  cacheFirma.calculadoEn = 0;
}

/**
 * Obtiene la firma actual del estado de la base de datos para que los clientes
 * conectados detecten cambios en vivo al instante.
 * @returns {Promise<{firma: string, timestamp: number}>}
 */
export async function obtenerEstadoSincronizacion() {
  const ahora = Date.now();
  if (ahora - cacheFirma.calculadoEn < TTL_CACHE_MS && cacheFirma.firma !== 'inicial') {
    return {
      firma: cacheFirma.firma,
      timestamp: cacheFirma.timestamp
    };
  }

  try {
    const fila = await queryUna(`
      SELECT
        (SELECT COUNT(*) FROM \`productos\`) AS p_cnt,
        (SELECT COALESCE(SUM(\`stock\`), 0) FROM \`productos\`) AS p_stk,
        (SELECT COALESCE(SUM(ROUND(COALESCE(\`precio_lista\`, 0) * 100)), 0) FROM \`productos\`) AS p_prc,
        (SELECT COALESCE(MAX(\`actualizado_en\`), '') FROM \`productos\`) AS p_upd,
        (SELECT COUNT(*) FROM \`equivalencias\`) AS eq_cnt,
        (SELECT COALESCE(MAX(\`id\`), 0) FROM \`equivalencias\`) AS eq_max,
        (SELECT COUNT(*) FROM \`categorias\`) AS c_cnt,
        (SELECT COALESCE(SUM(\`activo\`), 0) FROM \`categorias\`) AS c_act,
        (SELECT COALESCE(MAX(\`actualizado_en\`), '') FROM \`categorias\`) AS c_upd,
        (SELECT COUNT(*) FROM \`movimientos_stock\`) AS m_cnt,
        (SELECT COALESCE(MAX(\`id\`), 0) FROM \`movimientos_stock\`) AS m_max,
        (SELECT COUNT(*) FROM \`historial_precios\`) AS h_cnt,
        (SELECT COALESCE(MAX(\`id\`), 0) FROM \`historial_precios\`) AS h_max,
        (SELECT COUNT(*) FROM \`usuarios\`) AS u_cnt,
        (SELECT COALESCE(SUM(\`activo\`), 0) FROM \`usuarios\`) AS u_act,
        (SELECT COALESCE(MAX(\`actualizado_en\`), '') FROM \`usuarios\`) AS u_upd,
        (SELECT COALESCE(MAX(\`id\`), 0) FROM \`auditoria\`) AS a_max
    `);

    const nuevaFirma = fila
      ? [
          fila.p_cnt,
          fila.p_stk,
          fila.p_prc,
          fila.p_upd ? new Date(fila.p_upd).getTime() : 0,
          fila.eq_cnt,
          fila.eq_max,
          fila.c_cnt,
          fila.c_act,
          fila.c_upd ? new Date(fila.c_upd).getTime() : 0,
          fila.m_cnt,
          fila.m_max,
          fila.h_cnt,
          fila.h_max,
          fila.u_cnt,
          fila.u_act,
          fila.u_upd ? new Date(fila.u_upd).getTime() : 0,
          fila.a_max
        ].join(':')
      : String(ahora);

    if (nuevaFirma !== cacheFirma.firma) {
      cacheFirma = {
        firma: nuevaFirma,
        timestamp: ahora,
        calculadoEn: ahora
      };
    } else {
      cacheFirma.calculadoEn = ahora;
    }
  } catch {
    /* mantener última firma conocida si hay microcorte de red */
  }

  return {
    firma: cacheFirma.firma,
    timestamp: cacheFirma.timestamp || ahora
  };
}

/**
 * @file Utilidades de paginación (query params y metadatos de respuesta).
 * @module Server/utils/paginacion
 */

/**
 * Lee `pagina` y `limite` desde el query string, con valores por defecto y tope.
 * @param {Object} consulta Query string (`req.query`).
 * @param {Object} [opciones]
 * @param {number} [opciones.limiteDef] Tamaño por defecto.
 * @param {number} [opciones.limiteMax] Tope máximo permitido.
 * @returns {{pagina:number, limite:number, offset:number}}
 */
export function leerPaginacion(consulta = {}, opciones = {}) {
  const limiteDef = opciones.limiteDef ?? 20;
  const limiteMax = opciones.limiteMax ?? 100;

  let pagina = Number.parseInt(consulta.pagina ?? '1', 10);
  let limite = Number.parseInt(consulta.limite ?? String(limiteDef), 10);

  if (!Number.isFinite(pagina) || pagina < 1) pagina = 1;
  if (!Number.isFinite(limite) || limite < 1) limite = limiteDef;
  if (limite > limiteMax) limite = limiteMax;

  return { pagina, limite, offset: (pagina - 1) * limite };
}

/**
 * Construye los metadatos de una respuesta paginada.
 * @param {number} total Total de registros.
 * @param {number} pagina Página actual (1-based).
 * @param {number} limite Tamaño de página.
 * @returns {{total:number, pagina:number, limite:number, paginas:number}}
 */
export function metaPaginacion(total, pagina, limite) {
  return {
    total,
    pagina,
    limite,
    paginas: limite > 0 ? Math.ceil(total / limite) : 0
  };
}

/**
 * Construye la cláusula LIMIT/OFFSET como texto SQL seguro.
 * TiDB no admite marcadores (`?`) en LIMIT/OFFSET, por eso se interpolan
 * valores ya validados y normalizados a enteros no negativos.
 * @param {number} limite
 * @param {number} offset
 * @returns {string} Ej.: 'LIMIT 20 OFFSET 40'
 */
export function clausulaLimite(limite, offset) {
  const l = Math.max(0, Math.trunc(Number(limite) || 0));
  const o = Math.max(0, Math.trunc(Number(offset) || 0));
  return `LIMIT ${l} OFFSET ${o}`;
}

/**
 * Ordena resultados por una columna permitida (evita inyección en ORDER BY).
 * @param {string} columnaSolicitada
 * @param {string[]} permitidas
 * @param {string} porDefecto
 * @returns {string}
 */
export function columnaOrdenSegura(columnaSolicitada, permitidas, porDefecto) {
  return permitidas.includes(columnaSolicitada) ? columnaSolicitada : porDefecto;
}

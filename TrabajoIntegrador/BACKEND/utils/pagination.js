/**
 * pagination.js
 * Utilidades para paginación de listados.
 */

/**
 * @param {object} query req.query
 * @param {{defaultLimit?:number, maxLimit?:number}} [opts]
 * @returns {{page:number, limit:number, offset:number}}
 */
export function getPagination(query, opts = {}) {
  const defaultLimit = opts.defaultLimit ?? 20;
  const maxLimit = opts.maxLimit ?? 100;

  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);

  if (!Number.isInteger(page) || page < 1) page = 1;
  if (!Number.isInteger(limit) || limit < 1) limit = defaultLimit;
  if (limit > maxLimit) limit = maxLimit;

  return { page, limit, offset: (page - 1) * limit };
}

/**
 * Construye el objeto de metadatos de paginación.
 * @param {number} total
 * @param {number} page
 * @param {number} limit
 */
export function buildMeta(total, page, limit) {
  return {
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    hasNext: page * limit < total,
    hasPrev: page > 1,
  };
}

export default { getPagination, buildMeta };

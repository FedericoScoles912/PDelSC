/**
 * csv.js
 * Serialización de filas a CSV (para reportes exportables) y a "Excel" simple.
 */

/** Escapa un valor según RFC 4180. */
function escapeCsv(value) {
  if (value === null || value === undefined) return '';
  const s = String(value);
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/**
 * Convierte filas a CSV usando punto y coma (compatible con Excel en español).
 * @param {Array<object>} rows
 * @param {Array<{key:string, header:string}>} columns
 * @returns {string}
 */
export function toCsv(rows, columns) {
  const header = columns.map((c) => escapeCsv(c.header)).join(';');
  const body = rows.map((r) => columns.map((c) => escapeCsv(r[c.key])).join(';')).join('\n');
  return `\uFEFF${header}\n${body}`;
}

export default { toCsv };

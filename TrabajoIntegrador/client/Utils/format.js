/**
 * format.js
 * Formateadores de números, moneda y fechas (es-AR).
 */

export function formatCurrency(value, { moneda = 'ARS', vacio = '—' } = {}) {
  if (value === null || value === undefined || value === '') return vacio;
  const n = Number(value);
  if (Number.isNaN(n)) return vacio;
  try {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency', currency: moneda, maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `$ ${n.toLocaleString('es-AR')}`;
  }
}

export function formatNumber(value, dec = 0) {
  if (value === null || value === undefined || value === '') return '—';
  const n = Number(value);
  if (Number.isNaN(n)) return '—';
  return n.toLocaleString('es-AR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

export function formatDate(value, { conHora = false } = {}) {
  if (!value) return '—';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  const opts = { day: '2-digit', month: '2-digit', year: 'numeric' };
  if (conHora) return d.toLocaleString('es-AR', { ...opts, hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('es-AR', opts);
}

/** "hace 3 h", "ayer", etc. */
export function timeAgo(value) {
  if (!value) return '—';
  const d = new Date(value).getTime();
  const diff = Date.now() - d;
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'recién';
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const days = Math.floor(h / 24);
  if (days === 1) return 'ayer';
  if (days < 30) return `hace ${days} días`;
  return formatDate(value);
}

export default { formatCurrency, formatNumber, formatDate, timeAgo };

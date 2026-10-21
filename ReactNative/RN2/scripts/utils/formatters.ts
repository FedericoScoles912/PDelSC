/**
 * Utilidades para formatear valores de sensores, fechas y porcentajes.
 */

export function formatCoordinate(val: number | null, fallback = '--'): string {
  if (val === null || val === undefined || isNaN(val)) return fallback;
  return val.toFixed(6);
}

export function formatSensorValue(val: number | null, decimals = 3): string {
  if (val === null || val === undefined || isNaN(val)) return '0.000';
  const sign = val >= 0 ? '+' : '';
  return `${sign}${val.toFixed(decimals)}`;
}

export function formatPercentage(val: number | null): string {
  if (val === null || val === undefined || isNaN(val)) return '--%';
  return `${Math.round(val * 100)}%`;
}

export function formatDateTime(isoOrTimestamp: string | number | null): string {
  if (!isoOrTimestamp) return '--';
  const d = new Date(isoOrTimestamp);
  if (isNaN(d.getTime())) return '--';
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function formatHeading(headingDeg: number | null): string {
  if (headingDeg === null || isNaN(headingDeg)) return '0° N';
  const normalized = (headingDeg % 360 + 360) % 360;
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
  const index = Math.round(normalized / 45) % 8;
  return `${Math.round(normalized)}° ${directions[index]}`;
}

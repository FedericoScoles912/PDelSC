/**
 * Funciones de validación de entradas y URLs.
 */

export function isValidUrl(input: string): boolean {
  if (!input || typeof input !== 'string') return false;
  const trimmed = input.trim();
  const urlPattern = /^(https?:\/\/|www\.)[^\s/$.?#].[^\s]*$/i;
  return urlPattern.test(trimmed);
}

export function sanitizeUrl(input: string): string {
  const trimmed = input.trim();
  if (trimmed.startsWith('www.')) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

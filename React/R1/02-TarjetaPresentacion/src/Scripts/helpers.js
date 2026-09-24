export function generarId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

export function clamp(valor, min, max) {
  return Math.min(Math.max(valor, min), max);
}

export function capitalizar(texto) {
  if (!texto || typeof texto !== 'string') return '';
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export const SOLO_LETRAS_REGEX = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü´'’\s-]*$/;

export function filtrarSoloLetras(texto) {
  if (!texto || typeof texto !== 'string') return '';
  const invalidos = /[^A-Za-zÁÉÍÓÚáéíóúÑñÜü´'’\s-]/g;
  return texto.replace(invalidos, '');
}

export function esSoloLetras(texto) {
  if (!texto || typeof texto !== 'string') return false;
  return SOLO_LETRAS_REGEX.test(texto);
}

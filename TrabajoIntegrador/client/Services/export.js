/**
 * export.js
 * Descarga de reportes CSV. En web dispara la descarga del archivo; en
 * dispositivos nativos devuelve el texto (el llamador decide qué hacer).
 */
import { Platform } from 'react-native';
import { API_URL } from './apiConfig';
import { loadSession } from './storage';

/**
 * @param {string} path  ruta relativa, ej: '/reportes/stock/export?activo=1'
 * @param {string} filename nombre sugerido del archivo
 * @returns {Promise<'web'|'texto'>}
 */
export async function descargarCsv(path, filename = 'reporte.csv') {
  const session = await loadSession();
  const res = await fetch(`${API_URL}${path}`, {
    headers: session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {},
  });
  if (!res.ok) throw new Error('No se pudo generar el reporte');

  const texto = await res.text();

  if (Platform.OS === 'web' && globalThis.document) {
    const blob = new Blob([texto], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = globalThis.document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    return 'web';
  }

  return 'texto';
}

export default { descargarCsv };

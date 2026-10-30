/**
 * @file Utilidades de limpieza y normalización de texto/números para la
 *       importación de la lista de precios EMIC.
 * @module Scripts/lib/texto
 */

/** Marcadores de "sin dato" que aparecen en el Excel. */
const VACIOS = new Set(['', '-', '--', '---', '.', 'N/A', 'NA', 'S/D', 'SD']);

/**
 * Convierte el valor crudo de una celda en string limpio.
 * - Colapsa espacios repetidos y espacios no separables.
 * - Normaliza saltos de línea a `\n`.
 * @param {*} valor
 * @returns {string} Texto limpio ('' si no hay dato).
 */
export function limpiarTexto(valor) {
  if (valor === null || valor === undefined) return '';

  // ExcelJS puede devolver objetos: richText, hyperlink, fórmula ({result}).
  if (typeof valor === 'object') {
    if (Array.isArray(valor.richText)) {
      return limpiarTexto(valor.richText.map((fragmento) => fragmento.text ?? '').join(''));
    }
    if (valor.text !== undefined) return limpiarTexto(valor.text);
    if (valor.result !== undefined) return limpiarTexto(valor.result);
    if (valor.hyperlink !== undefined) return limpiarTexto(valor.hyperlink);
    if (valor instanceof Date) return valor.toISOString();
    return '';
  }

  const texto = String(valor)
    .replace(/\u00A0/g, ' ')     // NBSP -> espacio
    .replace(/\r\n?/g, '\n')     // CRLF/CR -> LF
    .replace(/[ \t]+/g, ' ')     // espacios repetidos
    .replace(/\n{3,}/g, '\n\n')  // saltos múltiples
    .trim();
  return texto;
}

/**
 * Indica si un texto representa ausencia de dato.
 * @param {*} valor
 * @returns {boolean}
 */
export function esVacio(valor) {
  const texto = limpiarTexto(valor).toUpperCase();
  return VACIOS.has(texto);
}

/**
 * Normaliza un código de producto / equivalencia:
 * - Quita espacios, puntos y guiones internos.
 * - Pasa a mayúsculas.
 * @param {*} valor
 * @returns {string}
 */
export function normalizarCodigo(valor) {
  return limpiarTexto(valor)
    .toUpperCase()
    .replace(/[\s.\-_/]/g, '');
}

/**
 * Convierte a número respetando la convención es-AR (coma decimal,
 * punto como separador de miles) y también valores ya numéricos.
 *
 * Ejemplos:
 *  - 40157        -> 40157
 *  - "125.846,50" -> 125846.5
 *  - "8,5"        -> 8.5
 *  - "85"         -> 85
 *  - "-" / ""     -> null
 * @param {*} valor
 * @returns {number|null}
 */
export function aNumero(valor) {
  if (valor === null || valor === undefined) return null;
  if (typeof valor === 'number') return Number.isFinite(valor) ? valor : null;

  let texto = limpiarTexto(valor);
  if (esVacio(texto)) return null;
  if (texto === '-') return null;

  texto = texto.replace(/[^\d.,\-]/g, '');
  if (texto === '' || texto === '-') return null;

  const tieneComa = texto.includes(',');
  const tienePunto = texto.includes('.');

  if (tieneComa && tienePunto) {
    // Se asume formato es-AR: 1.234,56 -> quitar puntos, coma -> punto
    texto = texto.replace(/\./g, '').replace(',', '.');
  } else if (tieneComa) {
    texto = texto.replace(',', '.');
  } else if (tienePunto) {
    // Podría ser separador de miles (1.234) o decimal (125846.5).
    // Si hay más de un punto o el bloque final tiene 3 dígitos -> miles.
    const partes = texto.split('.');
    const ultimo = partes[partes.length - 1];
    if (partes.length > 2 || (ultimo.length === 3 && partes[0].length <= 3)) {
      texto = texto.replace(/\./g, '');
    }
  }

  const numero = Number(texto);
  return Number.isFinite(numero) ? numero : null;
}

/**
 * Interpreta la celda de precio de lista.
 * Casos posibles: número, "PRÓXIMO INGRESO", "IDEM: <código>", vacío.
 * @param {*} valor
 * @returns {{precio:number|null, proximoIngreso:0|1, idemDe:string|null}}
 */
export function interpretarPrecio(valor) {
  const texto = limpiarTexto(valor);
  const mayus = texto.toUpperCase();

  if (texto === '') return { precio: null, proximoIngreso: 0, idemDe: null };

  if (mayus.includes('PROXIMO') || mayus.includes('PRÓXIMO')) {
    return { precio: null, proximoIngreso: 1, idemDe: null };
  }

  const coincidenciaIdem = mayus.match(/IDEM\s*:?\s*(.+)$/);
  if (coincidenciaIdem) {
    return {
      precio: null,
      proximoIngreso: 0,
      idemDe: normalizarCodigo(coincidenciaIdem[1])
    };
  }

  const numero = aNumero(texto);
  if (numero === null) {
    return { precio: null, proximoIngreso: 0, idemDe: null };
  }
  return { precio: numero, proximoIngreso: 0, idemDe: null };
}

/**
 * Detecta si una celda corresponde a una fila-encabezado de CATEGORÍA.
 * Las categorías del Excel vienen en mayúsculas, a veces con prefijos
 * decorativos (`>>>>`) y sin datos en el resto de las columnas.
 * @param {*} valor
 * @returns {boolean}
 */
export function pareceCategoria(valor) {
  const texto = limpiarTexto(valor);
  if (texto === '') return false;
  const limpio = texto.replace(/[>>#*_\-|]/g, ' ').replace(/\s+/g, ' ').trim();
  if (limpio.length < 6) return false;
  // Debe ser predominantemente mayúsculas y no contener dígitos de medida
  const tieneMinusculas = /[a-záéíóúñ]/.test(texto);
  return !tieneMinusculas;
}

/**
 * Convierte un texto en slug ASCII (para `categorias.slug`).
 * @param {string} texto
 * @returns {string}
 */
export function slugificar(texto) {
  return limpiarTexto(texto)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 150);
}

/**
 * Normaliza el nombre de categoría quitando prefijos decorativos
 * (`>>>>`, `===`, etc.) y dejando un nombre presentable.
 * @param {string} texto
 * @returns {string}
 */
export function normalizarNombreCategoria(texto) {
  return limpiarTexto(texto)
    .replace(/^[>#*=_|\-\s]+/, '')
    .replace(/[<#*=_|\-\s]+$/, '')
    .replace(/[|]/g, '/')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s*\/\s*/g, ' / ')
    .trim();
}

/**
 * Redondea a `decimales` posiciones (evita el ruido de coma flotante del
 * Excel: 119787.29999999999 -> 119787.3).
 * @param {number|null} numero
 * @param {number} [decimales]
 * @returns {number|null}
 */
export function redondear(numero, decimales = 2) {
  if (numero === null || numero === undefined || !Number.isFinite(numero)) return null;
  const factor = 10 ** decimales;
  return Math.round((numero + Number.EPSILON) * factor) / factor;
}

/**
 * Escapa un valor para usarlo dentro de una sentencia SQL.
 * @param {*} valor
 * @returns {string}
 */
export function escaparSql(valor) {
  if (valor === null || valor === undefined) return 'NULL';
  if (typeof valor === 'number') return Number.isFinite(valor) ? String(valor) : 'NULL';
  if (typeof valor === 'boolean') return valor ? '1' : '0';
  return `'${String(valor)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "''")
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '')}'`;
}

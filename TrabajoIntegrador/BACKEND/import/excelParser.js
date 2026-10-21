/**
 * excelParser.js
 * Parser puro del Excel "Retenes EMIC - Lista de Precios" (hoja "Por Medidas").
 *
 * No toca la base de datos: recibe la ruta de un .xlsx y devuelve una estructura
 * normalizada lista para persistir. Se reutiliza tanto en el script de importación
 * inicial como en la funcionalidad "re-importar lista de precios" del backend.
 *
 * Estructura del archivo (verificada contra la vigencia 01.NOV.2025):
 *   - Encabezados en las filas 11-12 (0-indexed).
 *   - Las CATEGORÍAS son filas con texto únicamente en la columna A.
 *   - Las SUB-MARCAS (ej. "M E R C E D E S   B E N Z") son filas sin dígitos en la
 *     columna del código: se registran como aviso y no se importan.
 *
 * @module excelParser
 */

// xlsx es CommonJS: se importa el paquete completo y se desestructura.
// eslint-disable-next-line import/default
import pkg from 'xlsx';
import path from 'node:path';

const { readFile, utils } = pkg;

/** Índices de columna (0-based) según la hoja "Por Medidas". */
const COL = {
  CODIGO: 1,
  LANZAMIENTO: 2,
  EJE: 3,
  ALOJ: 4,
  ALT: 5,
  GIRO: 6,
  UXB: 7,
  OBSERVACIONES: 10,
  OEM: 11,
  EQUIV_A: 12,
  EQUIV_S: 13,
  DISP: 15,
  PROX_EMB: 16,
  PRECIO: 18,
};

const FILA_INICIO_DATOS = 13; // a partir de aquí se buscan categorías y productos
const HOJA_ESPERADA = 'Por Medidas';
const GIROS_VALIDOS = new Set(['H', 'AH', 'LI', 'LISO', 'BI DIR']);

/**
 * Mapeo de los rótulos de sección del Excel a nombres de categoría "amigables"
 * (coinciden con el seed de categorías para no duplicarlas).
 */
const CATEGORIA_MAP = {
  'PORTA-RETENES | PLATINAS | SISTEMAS DE SELLADO': 'Porta-retenes / Platinas / Sistemas de sellado',
  'RETENES CONVENCIONALES (RADIALES)': 'Retenes convencionales (radiales)',
  'SELLOS DE VALVULAS': 'Sellos de valvulas',
  '>>>> LINEA PESADA (LANZAMIENTO)': 'Línea pesada (lanzamiento)',
  '>>>> LINEA LIVIANA & UTILITARIOS': 'Línea liviana & utilitarios',
};

/** Normaliza el rótulo de sección del Excel. */
function normalizarCategoria(raw) {
  if (CATEGORIA_MAP[raw]) return CATEGORIA_MAP[raw];
  return raw.replace(/^>+\s*/, '').trim();
}

/**
 * Normaliza texto: convierte null/undefined a null y colapsa espacios/saltos.
 * @param {*} value
 * @param {{saltos?: boolean}} [opts]
 * @returns {string|null}
 */
export function cleanText(value, opts = {}) {
  if (value === null || value === undefined) return null;
  let s = String(value).replace(/\u00a0/g, ' ').trim();
  if (s === '') return null;
  // saltos: true => conserva saltos de línea (útil para observaciones)
  s = opts.saltos ? s.replace(/[ \t]+/g, ' ').replace(/\n{2,}/g, '\n') : s.replace(/\s+/g, ' ');
  return s === '' ? null : s;
}

/**
 * Parsea una medida (EJE/ALOJ/ALT).
 * Guarda el texto original normalizado y, si hay un valor numérico, el primer
 * número (la coma decimal se interpreta como punto).
 * @param {*} raw
 * @returns {{texto: string|null, valor: number|null}}
 */
export function parseMeasure(raw) {
  const texto = cleanText(raw);
  if (texto === null) return { texto: null, valor: null };
  if (texto === '-') return { texto: '-', valor: null };

  const match = texto.match(/-?\d+(?:[.,]\d+)?/);
  if (!match) return { texto, valor: null };

  const valor = parseFloat(match[0].replace(',', '.'));
  return { texto, valor: Number.isFinite(valor) ? valor : null };
}

/**
 * Parsea el precio de lista.
 * Si en el Excel dice "PRÓXIMO INGRESO" => proximo=true y precio null.
 * @param {*} raw
 * @returns {{precio: number|null, proximoIngreso: boolean, aviso: string|null}}
 */
export function parsePrice(raw) {
  const s = cleanText(raw);
  if (s === null) return { precio: null, proximoIngreso: false, aviso: null };

  if (/pr[oó]ximo\s*ingreso/i.test(s)) {
    return { precio: null, proximoIngreso: true, aviso: null };
  }

  const compact = s.replace(/\s/g, '');
  let num;
  if (/,\d{1,2}$/.test(compact) && compact.includes('.')) {
    // Formato europeo 1.234,56
    num = parseFloat(compact.replace(/\./g, '').replace(',', '.'));
  } else if (/,\d{1,2}$/.test(compact)) {
    num = parseFloat(compact.replace(',', '.'));
  } else {
    num = parseFloat(compact);
  }

  if (!Number.isFinite(num)) {
    return { precio: null, proximoIngreso: false, aviso: `Precio no numérico: "${s}"` };
  }
  return { precio: Math.round(num * 100) / 100, proximoIngreso: false, aviso: null };
}

/** @returns {string|null} giro normalizado (H, AH, LI, LISO, BI DIR) o null. */
export function parseGiro(raw) {
  const s = cleanText(raw);
  if (s === null) return null;
  const up = s.toUpperCase().replace(/\s+/g, ' ');
  return GIROS_VALIDOS.has(up) ? up : up.slice(0, 16);
}

/** @returns {number|null} */
export function parseUxB(raw) {
  const s = cleanText(raw);
  if (s === null || s === '-') return null;
  const n = parseInt(s, 10);
  return Number.isInteger(n) ? n : null;
}

/**
 * Divide un campo de equivalencias (puede traer varios códigos por saltos de
 * línea) y limpia prefijos tipo "OE:", guiones y celdas vacías.
 * @param {*} raw
 * @param {string} tipo
 * @returns {Array<{tipo: string, codigo: string}>}
 */
export function parseEquivalencias(raw, tipo) {
  const s = cleanText(raw, { saltos: true });
  if (s === null) return [];
  return s
    .split(/\n/)
    .map((t) => t.trim().replace(/^o\.?e\.?\s*:?\s*/i, '').trim())
    .filter((t) => t !== '' && t !== '-')
    .map((codigo) => ({ tipo, codigo }));
}

/** Una fila es de categoría si sólo tiene contenido en la columna A. */
function esFilaCategoria(row) {
  const noVacias = row.reduce((acc, v) => (cleanText(v) !== null ? acc + 1 : acc), 0);
  return noVacias === 1 && cleanText(row[0]) !== null;
}

/** La celda de código es un producto si contiene al menos un dígito. */
function esFilaProducto(codigo) {
  return codigo !== null && /\d/.test(codigo) && !/^codigo/i.test(codigo);
}

/**
 * Lee el Excel y devuelve los datos normalizados.
 * @param {string} filePath Ruta del .xlsx
 * @returns {{ categorias: string[], productos: object[], descartes: Array<object>, advertencias: Array<object>, meta: object }}
 */
export function parseExcel(filePath) {
  const wb = readFile(filePath, { cellDates: false });
  const sheetName = wb.SheetNames.includes(HOJA_ESPERADA) ? HOJA_ESPERADA : wb.SheetNames[0];
  const hoja = wb.Sheets[sheetName];
  const rows = utils.sheet_to_json(hoja, { header: 1, raw: true, defval: null });

  const productos = [];
  const descartes = [];
  const advertencias = [];
  const categorias = [];
  const codigosVistos = new Map(); // codigo -> fila

  let categoriaActual = null;

  for (let i = FILA_INICIO_DATOS; i < rows.length; i++) {
    const row = rows[i] || [];
    const nroFilaExcel = i + 1; // fila visible en Excel

    if (esFilaCategoria(row)) {
      const rawNombre = cleanText(row[0]);
      if (rawNombre) {
        categoriaActual = normalizarCategoria(rawNombre);
        if (!categorias.includes(categoriaActual)) categorias.push(categoriaActual);
      }
      continue;
    }

    const codigo = cleanText(row[COL.CODIGO]);

    // Fila totalmente vacía
    if (codigo === null && cleanText(row[COL.OBSERVACIONES]) === null && cleanText(row[COL.PRECIO]) === null && cleanText(row[COL.EJE]) === null) {
      continue;
    }

    // Sub-cabecera de marca (letras espaciadas, sin dígitos) -> se ignora
    if (codigo !== null && !/\d/.test(codigo)) {
      advertencias.push({ fila: nroFilaExcel, motivo: `Sub-cabecera/marca ignorada: "${codigo}"`, categoria: categoriaActual });
      continue;
    }

    if (!esFilaProducto(codigo)) {
      descartes.push({ fila: nroFilaExcel, codigo, motivo: 'Fila sin código de producto válido' });
      continue;
    }

    if (codigosVistos.has(codigo)) {
      descartes.push({
        fila: nroFilaExcel,
        codigo,
        motivo: `Código duplicado (ya importado en fila ${codigosVistos.get(codigo)})`,
      });
      continue;
    }

    const eje = parseMeasure(row[COL.EJE]);
    const aloj = parseMeasure(row[COL.ALOJ]);
    const alt = parseMeasure(row[COL.ALT]);
    const precio = parsePrice(row[COL.PRECIO]);
    const disp = parseUxB(row[COL.DISP]);

    if (precio.aviso) {
      advertencias.push({ fila: nroFilaExcel, codigo, motivo: precio.aviso });
    }
    if (eje.valor === null && cleanText(row[COL.EJE]) !== null && cleanText(row[COL.EJE]) !== '-') {
      advertencias.push({ fila: nroFilaExcel, codigo, motivo: `EJE no numérico: "${cleanText(row[COL.EJE])}"` });
    }

    const equivalencias = [
      ...parseEquivalencias(row[COL.OEM], 'OEM'),
      ...parseEquivalencias(row[COL.EQUIV_A], 'A'),
      ...parseEquivalencias(row[COL.EQUIV_S], 'S'),
    ];
    // Deduplicar equivalencias idénticas
    const unicas = [];
    const seen = new Set();
    for (const e of equivalencias) {
      const key = `${e.tipo}|${e.codigo}`;
      if (!seen.has(key)) {
        seen.add(key);
        unicas.push(e);
      }
    }

    codigosVistos.set(codigo, nroFilaExcel);

    productos.push({
      fila: nroFilaExcel,
      codigo,
      categoriaNombre: categoriaActual,
      lanzamiento: cleanText(row[COL.LANZAMIENTO]),
      ejeTexto: eje.texto,
      ejeValor: eje.valor,
      alojTexto: aloj.texto,
      alojValor: aloj.valor,
      altTexto: alt.texto,
      altValor: alt.valor,
      giro: parseGiro(row[COL.GIRO]),
      uxb: parseUxB(row[COL.UXB]),
      observaciones: cleanText(row[COL.OBSERVACIONES], { saltos: true }),
      precioLista: precio.precio,
      proximoIngreso: precio.proximoIngreso ? 1 : 0,
      stockInicial: disp ?? 0,
      equivalencias: unicas,
    });
  }

  return {
    categorias,
    productos,
    descartes,
    advertencias,
    meta: {
      archivo: path.basename(filePath),
      hoja: sheetName,
      totalFilas: rows.length,
      productosValidos: productos.length,
      descartados: descartes.length,
      advertencias: advertencias.length,
      fechaProceso: new Date().toISOString(),
    },
  };
}

export default { parseExcel, cleanText, parseMeasure, parsePrice, parseGiro, parseUxB, parseEquivalencias };

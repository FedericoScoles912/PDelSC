/**
 * @file Servicio de reportes: genera exportaciones CSV/XLSX de productos,
 *       stock, movimientos y cambios de precios.
 * @module Server/servicios/reportes.servicio
 */

import ExcelJS from 'exceljs';

import { query } from '../config/db.js';
import { ApiError } from '../utils/http.js';

/** Definición de columnas por tipo de reporte. */
const COLUMNAS = {
  productos: [
    { clave: 'codigo', titulo: 'Código', tipo: 'texto' },
    { clave: 'categoria', titulo: 'Categoría', tipo: 'texto' },
    { clave: 'eje', titulo: 'Eje', tipo: 'texto' },
    { clave: 'aloj', titulo: 'Alojamiento', tipo: 'texto' },
    { clave: 'alt', titulo: 'Altura', tipo: 'texto' },
    { clave: 'giro', titulo: 'Giro', tipo: 'texto' },
    { clave: 'uxb', titulo: 'UxB', tipo: 'numero' },
    { clave: 'precio_lista', titulo: 'Precio lista', tipo: 'numero' },
    { clave: 'stock', titulo: 'Stock', tipo: 'numero' },
    { clave: 'stock_minimo', titulo: 'Stock mínimo', tipo: 'numero' },
    { clave: 'activo', titulo: 'Activo', tipo: 'numero' },
    { clave: 'proximo_ingreso', titulo: 'Próximo ingreso', tipo: 'numero' },
    { clave: 'proximo_embarque', titulo: 'Próximo embarque', tipo: 'numero' },
    { clave: 'observaciones', titulo: 'Observaciones', tipo: 'texto' }
  ],
  stock: [
    { clave: 'producto_id', titulo: 'ID producto', tipo: 'numero' },
    { clave: 'codigo', titulo: 'Código', tipo: 'texto' },
    { clave: 'categoria', titulo: 'Categoría', tipo: 'texto' },
    { clave: 'eje', titulo: 'Eje', tipo: 'texto' },
    { clave: 'aloj', titulo: 'Alojamiento', tipo: 'texto' },
    { clave: 'alt', titulo: 'Altura', tipo: 'texto' },
    { clave: 'stock', titulo: 'Stock', tipo: 'numero' },
    { clave: 'stock_minimo', titulo: 'Stock mínimo', tipo: 'numero' },
    { clave: 'bajo_minimo', titulo: 'Bajo mínimo', tipo: 'numero' },
    { clave: 'valor_stock', titulo: 'Valor stock', tipo: 'numero' }
  ],
  movimientos: [
    { clave: 'fecha', titulo: 'Fecha', tipo: 'texto' },
    { clave: 'codigo', titulo: 'Código', tipo: 'texto' },
    { clave: 'tipo', titulo: 'Tipo', tipo: 'texto' },
    { clave: 'cantidad', titulo: 'Cantidad', tipo: 'numero' },
    { clave: 'stock_anterior', titulo: 'Stock anterior', tipo: 'numero' },
    { clave: 'stock_resultante', titulo: 'Stock resultante', tipo: 'numero' },
    { clave: 'motivo', titulo: 'Motivo', tipo: 'texto' },
    { clave: 'referencia', titulo: 'Referencia', tipo: 'texto' },
    { clave: 'usuario', titulo: 'Usuario', tipo: 'texto' }
  ],
  precios: [
    { clave: 'fecha', titulo: 'Fecha', tipo: 'texto' },
    { clave: 'codigo', titulo: 'Código', tipo: 'texto' },
    { clave: 'precio_anterior', titulo: 'Precio anterior', tipo: 'numero' },
    { clave: 'precio_nuevo', titulo: 'Precio nuevo', tipo: 'numero' },
    { clave: 'origen', titulo: 'Origen', tipo: 'texto' },
    { clave: 'usuario', titulo: 'Usuario', tipo: 'texto' }
  ]
};

/**
 * Genera un reporte en el formato solicitado.
 * @param {'productos'|'stock'|'movimientos'|'precios'} tipo
 * @param {Object} [opciones]
 * @param {'csv'|'xlsx'} [opciones.formato]
 * @param {Object} [opciones.filtros]
 * @returns {Promise<{contenido:Buffer, nombreArchivo:string, contentType:string}>}
 */
export async function generarReporte(tipo, { formato = 'csv', filtros = {} } = {}) {
  const columnas = COLUMNAS[tipo];
  if (!columnas) {
    throw ApiError.solicitudInvalida('Tipo de reporte no válido.');
  }

  const filas = await obtenerFilas(tipo, filtros);
  const nombreArchivo = `${tipo}_${marcaTiempo()}.${formato}`;

  if (formato === 'xlsx') {
    return {
      contenido: await generarXlsx(columnas, filas),
      nombreArchivo,
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    };
  }

  return {
    contenido: generarCsv(columnas, filas),
    nombreArchivo,
    contentType: 'text/csv; charset=utf-8'
  };
}

/**
 * Ejecuta la consulta correspondiente al tipo de reporte.
 * @param {string} tipo
 * @param {Object} filtros
 * @returns {Promise<Array<Object>>}
 */
async function obtenerFilas(tipo, filtros = {}) {
  if (tipo === 'productos') {
    return query(
      `SELECT p.\`codigo\` AS codigo,
              COALESCE(c.\`nombre\`, 'Sin categoría') AS categoria,
              p.\`eje_texto\` AS eje, p.\`aloj_texto\` AS aloj, p.\`alt_texto\` AS alt,
              p.\`giro\` AS giro, p.\`uxb\` AS uxb, p.\`precio_lista\` AS precio_lista,
              p.\`stock\` AS stock, p.\`stock_minimo\` AS stock_minimo, p.\`activo\` AS activo,
              p.\`proximo_ingreso\` AS proximo_ingreso, p.\`proximo_embarque\` AS proximo_embarque,
              p.\`observaciones\` AS observaciones
         FROM \`productos\` p
         LEFT JOIN \`categorias\` c ON c.\`id\` = p.\`categoria_id\`
         ORDER BY p.\`codigo\``
    );
  }

  if (tipo === 'stock') {
    return query(
      `SELECT \`producto_id\`, \`codigo\`, \`categoria\`, \`eje\`, \`aloj\`, \`alt\`,
              \`stock\`, \`stock_minimo\`, \`bajo_minimo\`, \`valor_stock\`
         FROM \`vw_stock_actual\`
         ORDER BY \`codigo\``
    );
  }

  if (tipo === 'movimientos') {
    const condiciones = [];
    const parametros = [];
    if (filtros.desde) {
      condiciones.push('m.`creado_en` >= ?');
      parametros.push(filtros.desde);
    }
    if (filtros.hasta) {
      condiciones.push('m.`creado_en` <= ?');
      parametros.push(filtros.hasta);
    }
    const donde = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';

    return query(
      `SELECT DATE_FORMAT(m.\`creado_en\`, '%Y-%m-%d %H:%i:%s') AS fecha,
              p.\`codigo\` AS codigo, m.\`tipo\` AS tipo, m.\`cantidad\` AS cantidad,
              m.\`stock_anterior\` AS stock_anterior, m.\`stock_resultante\` AS stock_resultante,
              m.\`motivo\` AS motivo, m.\`referencia\` AS referencia,
              CONCAT(u.\`nombre\`, ' ', COALESCE(u.\`apellido\`, '')) AS usuario
         FROM \`movimientos_stock\` m
         LEFT JOIN \`productos\` p ON p.\`id\` = m.\`producto_id\`
         LEFT JOIN \`usuarios\` u ON u.\`id\` = m.\`usuario_id\`
         ${donde}
         ORDER BY m.\`creado_en\` DESC, m.\`id\` DESC`,
      parametros
    );
  }

  // precios
  return query(
    `SELECT DATE_FORMAT(h.\`creado_en\`, '%Y-%m-%d %H:%i:%s') AS fecha,
            p.\`codigo\` AS codigo, h.\`precio_anterior\` AS precio_anterior,
            h.\`precio_nuevo\` AS precio_nuevo, h.\`origen\` AS origen,
            CONCAT(u.\`nombre\`, ' ', COALESCE(u.\`apellido\`, '')) AS usuario
       FROM \`historial_precios\` h
       LEFT JOIN \`productos\` p ON p.\`id\` = h.\`producto_id\`
       LEFT JOIN \`usuarios\` u ON u.\`id\` = h.\`usuario_id\`
       ORDER BY h.\`creado_en\` DESC, h.\`id\` DESC`
  );
}

/**
 * Genera el contenido CSV (separador ';', BOM y decimales con coma).
 * @param {Array<Object>} columnas
 * @param {Array<Object>} filas
 * @returns {Buffer}
 */
function generarCsv(columnas, filas) {
  const lineas = [];
  lineas.push(columnas.map((col) => escaparCsv(col.titulo)).join(';'));

  for (const fila of filas) {
    const celdas = columnas.map((col) => escaparCsv(aTexto(fila[col.clave])));
    lineas.push(celdas.join(';'));
  }

  return Buffer.from(`\uFEFF${lineas.join('\r\n')}`, 'utf8');
}

/**
 * Genera el contenido XLSX usando ExcelJS.
 * @param {Array<Object>} columnas
 * @param {Array<Object>} filas
 * @returns {Promise<Buffer>}
 */
async function generarXlsx(columnas, filas) {
  const libro = new ExcelJS.Workbook();
  libro.creator = 'Sistema de Control de Stock';
  const hoja = libro.addWorksheet('Reporte');

  hoja.columns = columnas.map((col) => ({
    header: col.titulo,
    key: col.clave,
    width: Math.max(12, col.titulo.length + 4)
  }));

  for (const fila of filas) {
    const valores = {};
    for (const col of columnas) {
      const valor = fila[col.clave];
      if (col.tipo === 'numero' && valor !== null && valor !== undefined && valor !== '') {
        valores[col.clave] = Number(valor);
      } else {
        valores[col.clave] = valor === null || valor === undefined ? '' : valor;
      }
    }
    hoja.addRow(valores);
  }

  return Buffer.from(await libro.xlsx.writeBuffer());
}

/**
 * Convierte un valor a texto para CSV (decimales con coma).
 * @param {*} valor
 * @returns {string}
 */
function aTexto(valor) {
  if (valor === null || valor === undefined) return '';
  if (typeof valor === 'number') return String(valor).replace('.', ',');
  return String(valor);
}

/**
 * Escapa un valor para CSV: encierra en comillas y duplica comillas internas.
 * @param {*} valor
 * @returns {string}
 */
function escaparCsv(valor) {
  const texto = valor === null || valor === undefined ? '' : String(valor);
  return `"${texto.replace(/"/g, '""')}"`;
}

/**
 * Devuelve una marca de tiempo compacta para el nombre de archivo.
 * @returns {string}
 */
function marcaTiempo() {
  const ahora = new Date();
  const pad = (numero) => String(numero).padStart(2, '0');
  return (
    `${ahora.getFullYear()}${pad(ahora.getMonth() + 1)}${pad(ahora.getDate())}` +
    `_${pad(ahora.getHours())}${pad(ahora.getMinutes())}${pad(ahora.getSeconds())}`
  );
}

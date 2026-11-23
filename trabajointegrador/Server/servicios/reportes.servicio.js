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
  libro.creator = 'Stocker';
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

/** Limpia caracteres fuera de Latin-1/WinAnsi para streams PDF estándar Type1 Helvetica. */
function limpiarTextoPdf(texto) {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/([()\\])/g, '\\$1');
}

/**
 * Genera un documento PDF binario válido (%PDF-1.4) con la orden de pedido
 * de productos en alerta de bajo stock para enviar a la importadora.
 * @param {Object} entrada
 * @param {string} entrada.importador
 * @param {string} entrada.emailImportador
 * @param {string} [entrada.negocioNombre]
 * @param {string} [entrada.notas]
 * @param {Array<{codigo:string, cantidad:number, categoria?:string, medidas?:string, stockActual?:number, stockMinimo?:number}>} entrada.items
 * @returns {{contenido:Buffer, nombreArchivo:string, contentType:string, ordenId:string, totalUnidades:number}}
 */
export function generarPdfPedidoImportador({
  importador,
  emailImportador,
  negocioNombre = 'Negocio 1 — Stocker',
  notas = '',
  items = []
}) {
  if (!Array.isArray(items) || items.length === 0) {
    throw ApiError.solicitudInvalida('El carrito no contiene productos para generar el PDF.');
  }

  const ahora = new Date();
  const fechaLegible = ahora.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  const ordenId = `OC-${marcaTiempo()}`;
  const totalUnidades = items.reduce((acc, it) => acc + Math.max(1, Number(it.cantidad) || 0), 0);

  const ops = [];
  // Encabezado color terracota otoñal (#B4533A -> 0.706 0.325 0.227)
  ops.push('0.706 0.325 0.227 rg');
  ops.push('40 760 515 52 re f');

  ops.push('1 1 1 rg');
  ops.push('BT /F2 16 Tf 54 788 Td (' + limpiarTextoPdf('STOCKER - ORDEN DE COMPRA A IMPORTADORA') + ') Tj ET');
  ops.push(
    'BT /F1 10 Tf 54 770 Td (' +
      limpiarTextoPdf(`Ref: ${ordenId}   |   Fecha: ${fechaLegible}   |   Servidor: ${negocioNombre}`) +
      ') Tj ET'
  );

  // Caja de datos del Importador
  ops.push('0.96 0.94 0.91 rg');
  ops.push('40 688 515 60 re f');
  ops.push('0.23 0.18 0.16 rg');
  ops.push(
    'BT /F2 11 Tf 54 730 Td (' +
      limpiarTextoPdf(`IMPORTADOR / PROVEEDOR: ${importador}`) +
      ') Tj ET'
  );
  ops.push(
    'BT /F1 10 Tf 54 713 Td (' +
      limpiarTextoPdf(`EMAIL DESTINO: ${emailImportador}`) +
      ') Tj ET'
  );
  ops.push(
    'BT /F1 10 Tf 54 697 Td (' +
      limpiarTextoPdf(
        notas
          ? `Observaciones: ${notas.slice(0, 80)}`
          : `Motivo: Reposicion por alerta de bajo stock (${items.length} codigos / ${totalUnidades} unidades)`
      ) +
      ') Tj ET'
  );

  // Encabezado de tabla
  ops.push('0.37 0.45 0.27 rg');
  ops.push('40 656 515 22 re f');
  ops.push('1 1 1 rg');
  ops.push('BT /F2 10 Tf 50 663 Td (NRO) Tj ET');
  ops.push('BT /F2 10 Tf 90 663 Td (CODIGO PRODUCTO) Tj ET');
  ops.push('BT /F2 10 Tf 220 663 Td (CATEGORIA / MEDIDAS) Tj ET');
  ops.push('BT /F2 10 Tf 430 663 Td (UNIDADES SOLIC.) Tj ET');

  let y = 636;
  const maxFilas = Math.min(items.length, 25);

  for (let i = 0; i < maxFilas; i += 1) {
    const it = items[i];
    if (i % 2 === 1) {
      ops.push('0.98 0.96 0.94 rg');
      ops.push(`40 ${y - 5} 515 20 re f`);
    }
    ops.push('0.23 0.18 0.16 rg');
    const detalle = [it.categoria, it.medidas].filter(Boolean).join(' - ').slice(0, 34) || 'Reten / Sello';
    const cantTexto = `${Math.max(1, Number(it.cantidad) || 0)} u.`;

    ops.push(`BT /F1 10 Tf 52 ${y} Td (${limpiarTextoPdf(String(i + 1).padStart(2, '0'))}) Tj ET`);
    ops.push(`BT /F2 10 Tf 90 ${y} Td (${limpiarTextoPdf(String(it.codigo).slice(0, 20))}) Tj ET`);
    ops.push(`BT /F1 9 Tf 220 ${y} Td (${limpiarTextoPdf(detalle)}) Tj ET`);
    ops.push(`BT /F2 10 Tf 455 ${y} Td (${limpiarTextoPdf(cantTexto)}) Tj ET`);
    y -= 20;
  }

  // Línea y resumen total
  y -= 10;
  ops.push('0.706 0.325 0.227 rg');
  ops.push(`40 ${y} 515 26 re f`);
  ops.push('1 1 1 rg');
  ops.push(
    `BT /F2 11 Tf 54 ${y + 8} Td (${limpiarTextoPdf(
      `TOTAL DE CODIGOS: ${items.length}     |     TOTAL UNIDADES SOLICITADAS: ${totalUnidades} UNIDADES`
    )}) Tj ET`
  );

  ops.push('0.43 0.37 0.32 rg');
  ops.push(
    `BT /F1 8 Tf 40 42 Td (${limpiarTextoPdf(
      `Documento PDF generado automaticamente por Stocker (${negocioNombre}) para envio a ${importador} <${emailImportador}>.`
    )}) Tj ET`
  );

  const streamData = ops.join('\n');
  const objetos = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj\n',
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n',
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n',
    `6 0 obj\n<< /Length ${Buffer.byteLength(streamData, 'utf8')} >>\nstream\n${streamData}\nendstream\nendobj\n`
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  for (const obj of objetos) {
    offsets.push(Buffer.byteLength(pdf, 'utf8'));
    pdf += obj;
  }

  const xrefOffset = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${objetos.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i <= objetos.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objetos.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return {
    contenido: Buffer.from(pdf, 'utf8'),
    nombreArchivo: `pedido_${limpiarTextoPdf(importador).replace(/\s+/g, '_').toLowerCase() || 'importador'}_${marcaTiempo()}.pdf`,
    contentType: 'application/pdf',
    ordenId,
    totalUnidades
  };
}

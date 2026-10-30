/**
 * @file Generador de `SQL/06_seed_productos.sql` a partir de los datos
 *       estructurados del Excel. Produce INSERTs por lotes (máx. ~500 filas por
 *       sentencia) para poder cargar los datos directamente desde MySQL
 *       Workbench sin pasar por Node.
 *
 *       Todo el script es IDEMPOTENTE:
 *        - categorías: INSERT ... ON DUPLICATE KEY UPDATE (por `nombre`)
 *        - productos:  INSERT ... ON DUPLICATE KEY UPDATE (por `codigo`)
 *        - equivalencias: INSERT IGNORE resolviendo el `producto_id` por código
 * @module Scripts/lib/generador_sql
 */

import { escaparSql, slugificar } from './texto.js';

/** Máximo de filas por sentencia INSERT (límite seguro de tamaño de txn en TiDB). */
export const TAMANO_LOTE = 500;

/**
 * Genera el contenido completo del archivo de seed.
 * @param {Object} datos
 * @param {string[]} datos.categorias  Nombres de categoría en orden de aparición.
 * @param {Array<Object>} datos.productos  Productos estructurados.
 * @param {Object} [opciones]
 * @param {number} [opciones.tamanoLote]
 * @param {string} [opciones.archivoOrigen]
 * @returns {string} Contenido SQL.
 */
export function generarSeedProductos(datos, opciones = {}) {
  const tamanoLote = opciones.tamanoLote ?? TAMANO_LOTE;
  const { categorias = [], productos = [] } = datos;

  const partes = [];
  partes.push(cabecera(opciones.archivoOrigen));

  partes.push(seccionCategorias(categorias));
  partes.push(seccionProductos(productos, tamanoLote));
  partes.push(seccionEquivalencias(productos, tamanoLote));
  partes.push(seccionVerificacion(productos.length, categorias.length));

  return partes.join('\n');
}

/**
 * Cabecera del archivo.
 * @param {string} [archivoOrigen]
 * @returns {string}
 */
function cabecera(archivoOrigen) {
  const fecha = new Date().toISOString();
  return `-- ============================================================================
--  06_seed_productos.sql  --  GENERADO AUTOMÁTICAMENTE por Scripts/importar_excel.js
--  Archivo origen: ${archivoOrigen ?? 'imports/Retenes_EMIC__Lista_de_Precios_-_Vigencia_01_Nov_2025.xlsx'}
--  Generado: ${fecha}
-- ----------------------------------------------------------------------------
--  Carga la lista de precios EMIC sin necesidad de correr Node.
--  Idempotente: puede ejecutarse varias veces sin duplicar datos.
--  Ejecutar DESPUÉS de 01_schema.sql, 02/02b_tables.sql, 03_indexes.sql y
--  04_seed_roles_admin.sql.
-- ============================================================================

USE \`retenes_stock\`;
`;
}

/**
 * Sección de categorías.
 * @param {string[]} categorias
 * @returns {string}
 */
function seccionCategorias(categorias) {
  if (!categorias.length) return '-- (sin categorías detectadas)\n';

  const filas = categorias.map((nombre, indice) => {
    return `  (${escaparSql(nombre)}, ${escaparSql(slugificar(nombre))}, ${indice + 1})`;
  });

  return `-- ---------------------------------------------------------------------------
--  CATEGORÍAS detectadas a partir de las filas-encabezado del Excel
-- ---------------------------------------------------------------------------
INSERT INTO \`categorias\` (\`nombre\`, \`slug\`, \`orden\`) VALUES
${filas.join(',\n')}
ON DUPLICATE KEY UPDATE
  \`slug\`  = VALUES(\`slug\`),
  \`orden\` = VALUES(\`orden\`);
`;
}

/**
 * Sección de productos.
 * @param {Array<Object>} productos
 * @param {number} tamanoLote
 * @returns {string}
 */
function seccionProductos(productos, tamanoLote) {
  if (!productos.length) return '-- (sin productos)\n';

  const columnas = [
    'codigo', 'categoria_id', 'lanzamiento',
    'eje_texto', 'eje_valor', 'aloj_texto', 'aloj_valor', 'alt_texto', 'alt_valor',
    'giro', 'uxb', 'observaciones', 'precio_lista', 'proximo_ingreso',
    'proximo_embarque', 'stock', 'stock_minimo', 'activo'
  ];

  const partes = [`-- ---------------------------------------------------------------------------
--  PRODUCTOS (${productos.length} registros, lotes de ${tamanoLote})
-- ---------------------------------------------------------------------------`];

  for (let i = 0; i < productos.length; i += tamanoLote) {
    const lote = productos.slice(i, i + tamanoLote);
    const filas = lote.map((p) => `  (${filaProducto(p)})`);
    partes.push(`INSERT INTO \`productos\` (${columnas.map((c) => `\`${c}\``).join(', ')}) VALUES
${filas.join(',\n')}
ON DUPLICATE KEY UPDATE
  \`categoria_id\`    = VALUES(\`categoria_id\`),
  \`lanzamiento\`     = VALUES(\`lanzamiento\`),
  \`eje_texto\`       = VALUES(\`eje_texto\`),
  \`eje_valor\`       = VALUES(\`eje_valor\`),
  \`aloj_texto\`      = VALUES(\`aloj_texto\`),
  \`aloj_valor\`      = VALUES(\`aloj_valor\`),
  \`alt_texto\`       = VALUES(\`alt_texto\`),
  \`alt_valor\`       = VALUES(\`alt_valor\`),
  \`giro\`            = VALUES(\`giro\`),
  \`uxb\`             = VALUES(\`uxb\`),
  \`observaciones\`   = VALUES(\`observaciones\`),
  \`precio_lista\`    = VALUES(\`precio_lista\`),
  \`proximo_ingreso\` = VALUES(\`proximo_ingreso\`),
  \`proximo_embarque\` = VALUES(\`proximo_embarque\`),
  \`stock\`           = VALUES(\`stock\`),
  \`stock_minimo\`    = VALUES(\`stock_minimo\`),
  \`activo\`          = VALUES(\`activo\`);
`); // fin INSERT producto
  }

  return partes.join('\n');
}

/**
 * Construye la tupla de valores de un producto.
 * `categoria_id` se resuelve con subconsulta por `slug` para no depender de IDs.
 * @param {Object} p
 * @returns {string}
 */
function filaProducto(p) {
  const categoria = p.categoriaNombre
    ? `(SELECT \`id\` FROM \`categorias\` WHERE \`nombre\` = ${escaparSql(p.categoriaNombre)} LIMIT 1)`
    : 'NULL';

  return [
    escaparSql(p.codigo),
    categoria,
    p.lanzamiento ? 1 : 0,
    escaparSql(p.ejeTexto),
    escaparSql(p.ejeValor),
    escaparSql(p.alojTexto),
    escaparSql(p.alojValor),
    escaparSql(p.altTexto),
    escaparSql(p.altValor),
    escaparSql(p.giro),
    escaparSql(p.uxb),
    escaparSql(p.observaciones ?? null),
    escaparSql(p.precioLista),
    p.proximoIngreso ? 1 : 0,
    escaparSql(p.proximoEmbarque ?? 0),
    escaparSql(p.stockInicial ?? 0),
    escaparSql(p.stockMinimo ?? 0),
    1
  ].join(', ');
}

/**
 * Sección de equivalencias (relación 1-N), resolviendo `producto_id` por código.
 * @param {Array<Object>} productos
 * @param {number} tamanoLote
 * @returns {string}
 */
function seccionEquivalencias(productos, tamanoLote) {
  const equivalencias = [];
  for (const p of productos) {
    for (const e of p.equivalencias ?? []) {
      if (e && e.codigo) equivalencias.push({ codigoProducto: p.codigo, tipo: e.tipo, codigo: e.codigo });
    }
  }

  if (!equivalencias.length) return '-- (sin equivalencias)\n';

  const partes = [`-- ---------------------------------------------------------------------------
--  EQUIVALENCIAS (${equivalencias.length} registros: OEM / A / S)
-- ---------------------------------------------------------------------------`];

  for (let i = 0; i < equivalencias.length; i += tamanoLote) {
    const lote = equivalencias.slice(i, i + tamanoLote);
    const selects = lote.map(
      (e) => `  SELECT ${escaparSql(e.codigoProducto)} AS cod, ${escaparSql(e.tipo)} AS tipo, ${escaparSql(e.codigo)} AS equiv`
    );

    partes.push(`INSERT IGNORE INTO \`equivalencias\` (\`producto_id\`, \`tipo\`, \`codigo\`)
SELECT p.\`id\`, v.tipo, v.equiv
FROM (
${selects.join('\n  UNION ALL\n')}
) v
JOIN \`productos\` p ON p.\`codigo\` = v.cod;
`); // fin INSERT equivalencias
  }

  return partes.join('\n');
}

/**
 * Bloque final de verificación.
 * @param {number} totalProductos
 * @param {number} totalCategorias
 * @returns {string}
 */
function seccionVerificacion(totalProductos, totalCategorias) {
  return `-- ---------------------------------------------------------------------------
--  VERIFICACIÓN
-- ---------------------------------------------------------------------------
SELECT
  'categorias' AS tabla, COUNT(*) AS filas, ${totalCategorias} AS esperado FROM \`categorias\`
UNION ALL
SELECT 'productos', COUNT(*), ${totalProductos} FROM \`productos\`
UNION ALL
SELECT 'equivalencias', COUNT(*), 0 FROM \`equivalencias\`;
`;
}

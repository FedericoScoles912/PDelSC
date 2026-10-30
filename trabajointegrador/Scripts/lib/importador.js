/**
 * @file Lógica de importación: comparación previa (preview) y aplicación real
 *       sobre TiDB/MySQL. Se usa tanto desde el CLI como desde el endpoint
 *       protegido de importación (solo Administrador).
 *
 *       Características:
 *        - Idempotente: UPSERT por `codigo` (INSERT ... ON DUPLICATE KEY UPDATE).
 *        - Por lotes dentro de transacciones (límite de tamaño de txn en TiDB).
 *        - Registra historial de precios cuando el precio cambia.
 *        - Sin stored procedures ni triggers: toda la lógica vive en Node.js.
 * @module Scripts/lib/importador
 */

import { query, conTransaccion, conReintentos } from '../../Server/config/db.js';
import { slugificar } from './texto.js';

/** Filas por lote (conserva transacciones chicas en TiDB Cloud). */
export const TAMANO_LOTE_BD = 200;

/**
 * @typedef {Object} DatosImportacion
 * @property {string[]} categorias
 * @property {Array<Object>} productos
 * @property {Array<Object>} descartes
 * @property {Array<Object>} advertencias
 * @property {Object} meta
 */

/**
 * Compara los datos del Excel contra lo que ya existe en la base.
 * No escribe nada: sirve para la vista previa antes de confirmar.
 * @param {DatosImportacion} datos
 * @returns {Promise<Object>} Resumen del impacto.
 */
export async function generarPreview(datos) {
  const categoriasExistentes = new Set(
    (await query('SELECT `nombre` FROM `categorias`')).map((fila) => fila.nombre)
  );

  const codigos = datos.productos.map((p) => p.codigo);
  const preciosActuales = new Map();
  const existentes = new Set();

  for (const lote of enLotes(codigos, 500)) {
    if (!lote.length) continue;
    const marcadores = lote.map(() => '?').join(',');
    const filas = await query(
      `SELECT \`codigo\`, \`precio_lista\` FROM \`productos\` WHERE \`codigo\` IN (${marcadores})`,
      lote
    );
    for (const fila of filas) {
      existentes.add(fila.codigo);
      preciosActuales.set(fila.codigo, fila.precio_lista);
    }
  }

  const nuevos = [];
  const actualizados = [];
  const sinCambios = [];
  const cambiosDePrecio = [];

  for (const producto of datos.productos) {
    if (!existentes.has(producto.codigo)) {
      nuevos.push(producto.codigo);
      continue;
    }
    const precioAnterior = preciosActuales.get(producto.codigo);
    const precioNuevo = producto.precioLista;
    if (numeroDistinto(precioAnterior, precioNuevo)) {
      actualizados.push(producto.codigo);
      cambiosDePrecio.push({ codigo: producto.codigo, anterior: precioAnterior, nuevo: precioNuevo });
    } else {
      sinCambios.push(producto.codigo);
    }
  }

  return {
    meta: datos.meta,
    categorias: {
      nuevas: datos.categorias.filter((c) => !categoriasExistentes.has(c)),
      existentes: datos.categorias.filter((c) => categoriasExistentes.has(c))
    },
    productos: {
      total: datos.productos.length,
      nuevos: nuevos.length,
      actualizados: actualizados.length,
      sinCambios: sinCambios.length
    },
    cambiosDePrecio,
    descartes: datos.descartes,
    advertencias: datos.advertencias,
    equivalencias: datos.productos.reduce((total, p) => total + (p.equivalencias?.length ?? 0), 0)
  };
}

/**
 * Aplica la importación completa sobre la base de datos.
 * @param {DatosImportacion} datos
 * @param {Object} [opciones]
 * @param {number|null} [opciones.usuarioId]  Usuario que ejecuta (auditoría).
 * @param {boolean} [opciones.registrarHistorialPrecios]
 * @returns {Promise<Object>} Resumen de lo aplicado.
 */
export async function aplicarImportacion(datos, opciones = {}) {
  const usuarioId = opciones.usuarioId ?? null;
  const registrarHistorial = opciones.registrarHistorialPrecios ?? true;

  const resumen = {
    categorias: 0,
    productosInsertados: 0,
    productosActualizados: 0,
    productosSinCambios: 0,
    equivalencias: 0,
    preciosActualizados: 0
  };

  // 1) Categorías (idempotente por nombre).
  resumen.categorias = await upsertCategorias(datos.categorias);
  const idPorCategoriaNombre = await mapaCategorias();

  // 2) Productos + equivalencias + historial de precios, por lotes.
  for (const lote of enLotes(datos.productos, TAMANO_LOTE_BD)) {
    const resultado = await conReintentos(() =>
      conTransaccion(async (conexion) => {
        const codigos = lote.map((p) => p.codigo);
        const marcadores = codigos.map(() => '?').join(',');

        const [filasPrevias] = await conexion.execute(
          `SELECT ${COLUMNAS_COMPARABLES.map((c) => `\`${c}\``).join(', ')}
             FROM \`productos\` WHERE \`codigo\` IN (${marcadores})`,
          codigos
        );
        const previos = new Map(filasPrevias.map((fila) => [fila.codigo, fila]));

        const { sql, parametros } = construirUpsertProductos(lote);
        await conexion.execute(sql, parametros);

        // TiDB devuelve affectedRows = 2 para toda fila que choca con la clave
        // única, AUNQUE los valores sean idénticos (no implementa el 0 de MySQL
        // para "sin cambios"). Por eso el conteo se calcula comparando campo por
        // campo contra el estado previo en la base, no con affectedRows.
        let insertados = 0;
        let actualizados = 0;
        let sinCambios = 0;
        for (const producto of lote) {
          const previo = previos.get(producto.codigo);
          if (!previo) {
            insertados += 1;
          } else if (productoCambio(previo, producto, idPorCategoriaNombre)) {
            actualizados += 1;
          } else {
            sinCambios += 1;
          }
        }

        // Resolver ids para equivalencias e historial.
        const [filasActuales] = await conexion.execute(
          `SELECT \`id\`, \`codigo\`, \`precio_lista\` FROM \`productos\` WHERE \`codigo\` IN (${marcadores})`,
          codigos
        );
        const idPorCodigo = new Map(filasActuales.map((fila) => [fila.codigo, fila.id]));

        const equivalencias = construirEquivalencias(lote, idPorCodigo);
        if (equivalencias.sql) {
          const [resultadoEquiv] = await conexion.execute(equivalencias.sql, equivalencias.parametros);
          resumen.equivalencias += resultadoEquiv.affectedRows ?? 0;
        }

        if (registrarHistorial) {
          const historial = construirHistorial(lote, previos, idPorCodigo, usuarioId);
          if (historial.sql) {
            const [resultadoHistorial] = await conexion.execute(historial.sql, historial.parametros);
            resumen.preciosActualizados += resultadoHistorial.affectedRows ?? 0;
          }
        }

        return { insertados, actualizados, sinCambios };
      })
    );

    resumen.productosInsertados += resultado.insertados;
    resumen.productosActualizados += resultado.actualizados;
    resumen.productosSinCambios += resultado.sinCambios;
  }

  return resumen;
}

/**
 * Registra categorías y devuelve cuántas quedaron (total enviado).
 * @param {string[]} categorias
 * @returns {Promise<number>}
 */
async function upsertCategorias(categorias) {
  if (!categorias.length) return 0;

  const valores = categorias.map((nombre, indice) => [nombre, slugificar(nombre), indice + 1]);
  const marcadores = valores.map(() => '(?, ?, ?)').join(',');
  const parametros = valores.flat();

  await query(
    `INSERT INTO \`categorias\` (\`nombre\`, \`slug\`, \`orden\`) VALUES ${marcadores}
     ON DUPLICATE KEY UPDATE \`slug\` = VALUES(\`slug\`), \`orden\` = VALUES(\`orden\`)`,
    parametros
  );

  return categorias.length;
}

/**
 * Construye la sentencia UPSERT de productos para un lote.
 * @param {Array<Object>} lote
 * @returns {{sql:string, parametros:Array<*>}}
 */
function construirUpsertProductos(lote) {
  const columnas = [
    'codigo', 'categoria_id', 'lanzamiento',
    'eje_texto', 'eje_valor', 'aloj_texto', 'aloj_valor', 'alt_texto', 'alt_valor',
    'giro', 'uxb', 'observaciones', 'precio_lista', 'proximo_ingreso',
    'proximo_embarque', 'stock', 'stock_minimo', 'activo'
  ];

  const parametros = [];
  const filas = lote.map((producto) => {
    parametros.push(
      producto.codigo,
      producto.categoriaNombre ?? null,
      producto.lanzamiento ? 1 : 0,
      producto.ejeTexto,
      producto.ejeValor,
      producto.alojTexto,
      producto.alojValor,
      producto.altTexto,
      producto.altValor,
      producto.giro,
      producto.uxb,
      producto.observaciones,
      producto.precioLista,
      producto.proximoIngreso ? 1 : 0,
      producto.proximoEmbarque ?? 0,
      producto.stockInicial ?? 0,
      producto.stockMinimo ?? 0,
      1
    );
    return `(${marcadoresProducto()})`;
  });

  const sql = `INSERT INTO \`productos\` (${columnas.map((c) => `\`${c}\``).join(', ')})
VALUES ${filas.join(',\n')}
ON DUPLICATE KEY UPDATE
  \`categoria_id\`     = VALUES(\`categoria_id\`),
  \`lanzamiento\`      = VALUES(\`lanzamiento\`),
  \`eje_texto\`        = VALUES(\`eje_texto\`),
  \`eje_valor\`        = VALUES(\`eje_valor\`),
  \`aloj_texto\`       = VALUES(\`aloj_texto\`),
  \`aloj_valor\`       = VALUES(\`aloj_valor\`),
  \`alt_texto\`        = VALUES(\`alt_texto\`),
  \`alt_valor\`        = VALUES(\`alt_valor\`),
  \`giro\`             = VALUES(\`giro\`),
  \`uxb\`              = VALUES(\`uxb\`),
  \`observaciones\`    = VALUES(\`observaciones\`),
  \`precio_lista\`     = VALUES(\`precio_lista\`),
  \`proximo_ingreso\`  = VALUES(\`proximo_ingreso\`),
  \`proximo_embarque\` = VALUES(\`proximo_embarque\`),
  \`stock_minimo\`     = VALUES(\`stock_minimo\`),
  \`activo\`           = VALUES(\`activo\`)`;

  return { sql, parametros };
}

/**
 * Marcadores de la tupla de producto (categoria_id se resuelve con subconsulta).
 * @returns {string}
 */
function marcadoresProducto() {
  return [
    '?', '(SELECT `id` FROM `categorias` WHERE `nombre` = ? LIMIT 1)', '?',
    '?', '?', '?', '?', '?', '?',
    '?', '?', '?', '?', '?',
    '?', '?', '?', '?'
  ].join(', ');
}

/**
 * Construye el INSERT IGNORE de equivalencias resolviendo `producto_id` por id.
 * @param {Array<Object>} lote
 * @param {Map<string, number>} idPorCodigo
 * @returns {{sql:string, parametros:Array<*>}}
 */
function construirEquivalencias(lote, idPorCodigo) {
  const filas = [];
  const parametros = [];

  for (const producto of lote) {
    const productoId = idPorCodigo.get(producto.codigo);
    if (!productoId) continue;
    for (const equivalencia of producto.equivalencias ?? []) {
      filas.push('(?, ?, ?)');
      parametros.push(productoId, equivalencia.tipo, equivalencia.codigo);
    }
  }

  if (!filas.length) return { sql: null, parametros: [] };

  return {
    sql: `INSERT IGNORE INTO \`equivalencias\` (\`producto_id\`, \`tipo\`, \`codigo\`) VALUES ${filas.join(', ')}`,
    parametros
  };
}

/**
 * Construye el INSERT de historial de precios para los productos cuyo precio cambió.
 * @param {Array<Object>} lote
 * @param {Map<string, Object>} previos
 * @param {Map<string, number>} idPorCodigo
 * @param {number|null} usuarioId
 * @returns {{sql:string, parametros:Array<*>}}
 */
function construirHistorial(lote, previos, idPorCodigo, usuarioId) {
  const filas = [];
  const parametros = [];

  for (const producto of lote) {
    const previo = previos.get(producto.codigo);
    if (!previo) continue; // producto nuevo: sin precio anterior que registrar
    if (!numeroDistinto(previo.precio_lista, producto.precioLista)) continue;

    const productoId = idPorCodigo.get(producto.codigo);
    if (!productoId) continue;

    filas.push('(?, ?, ?, ?, ?)');
    parametros.push(productoId, previo.precio_lista, producto.precioLista, 'importacion', usuarioId);
  }

  if (!filas.length) return { sql: null, parametros: [] };

  return {
    sql: `INSERT INTO \`historial_precios\` (\`producto_id\`, \`precio_anterior\`, \`precio_nuevo\`, \`origen\`, \`usuario_id\`) VALUES ${filas.join(', ')}`,
    parametros
  };
}

/**
 * Divide un array en lotes.
 * @template T
 * @param {T[]} arreglo
 * @param {number} tamano
 * @returns {T[][]}
 */
export function enLotes(arreglo, tamano) {
  const lotes = [];
  for (let i = 0; i < arreglo.length; i += tamano) {
    lotes.push(arreglo.slice(i, i + tamano));
  }
  return lotes;
}

/**
 * Compara dos precios tratando `null` y `undefined` como equivalentes.
 * @param {number|null} a
 * @param {number|null} b
 * @returns {boolean}
 */
function numeroDistinto(a, b) {
  const na = a === null || a === undefined ? null : Number(a);
  const nb = b === null || b === undefined ? null : Number(b);
  if (na === null && nb === null) return false;
  if (na === null || nb === null) return true;
  return Math.abs(na - nb) > 0.009;
}

/**
 * Columnas de `productos` que el UPSERT puede modificar; se usan para comparar
 * el estado previo en la base contra los datos entrantes del Excel.
 * @type {string[]}
 */
const COLUMNAS_COMPARABLES = [
  'id', 'codigo', 'categoria_id',
  'lanzamiento', 'eje_texto', 'eje_valor', 'aloj_texto', 'aloj_valor', 'alt_texto', 'alt_valor',
  'giro', 'uxb', 'observaciones', 'precio_lista', 'proximo_ingreso', 'proximo_embarque',
  'stock_minimo', 'activo'
];

/**
 * Mapa `nombre` de categoría → `id`.
 * @returns {Promise<Map<string, number>>}
 */
async function mapaCategorias() {
  const filas = await query('SELECT `id`, `nombre` FROM `categorias`');
  return new Map(filas.map((fila) => [fila.nombre, fila.id]));
}

/**
 * Determina si el UPSERT modificaría realmente la fila previa.
 * @param {Object} previo   Fila actual en la base (columnas de COLUMNAS_COMPARABLES).
 * @param {Object} producto Producto entrante del Excel.
 * @param {Map<string, number>} idPorCategoriaNombre
 * @returns {boolean}
 */
function productoCambio(previo, producto, idPorCategoriaNombre) {
  const categoriaId = idPorCategoriaNombre.get(producto.categoriaNombre) ?? null;
  return (
    !mismoEntero(previo.categoria_id, categoriaId) ||
    !mismoBooleano(previo.lanzamiento, producto.lanzamiento ? 1 : 0) ||
    !mismoTexto(previo.eje_texto, producto.ejeTexto) ||
    !mismoNumero(previo.eje_valor, producto.ejeValor) ||
    !mismoTexto(previo.aloj_texto, producto.alojTexto) ||
    !mismoNumero(previo.aloj_valor, producto.alojValor) ||
    !mismoTexto(previo.alt_texto, producto.altTexto) ||
    !mismoNumero(previo.alt_valor, producto.altValor) ||
    !mismoTexto(previo.giro, producto.giro) ||
    !mismoTexto(previo.uxb, producto.uxb) ||
    !mismoTexto(previo.observaciones, producto.observaciones) ||
    !mismoNumero(previo.precio_lista, producto.precioLista) ||
    !mismoBooleano(previo.proximo_ingreso, producto.proximoIngreso ? 1 : 0) ||
    !mismoEntero(previo.proximo_embarque, producto.proximoEmbarque ?? 0) ||
    !mismoEntero(previo.stock_minimo, producto.stockMinimo ?? 0) ||
    !mismoBooleano(previo.activo, 1)
  );
}

/**
 * Igualdad de campos de texto (vacío y `null` se consideran equivalentes).
 * @param {*} a
 * @param {*} b
 * @returns {boolean}
 */
function mismoTexto(a, b) {
  const na = a === null || a === undefined ? '' : String(a).trim();
  const nb = b === null || b === undefined ? '' : String(b).trim();
  return na === nb;
}

/**
 * Igualdad de campos decimales con tolerancia (ruido de coma flotante).
 * @param {*} a
 * @param {*} b
 * @returns {boolean}
 */
function mismoNumero(a, b) {
  const na = a === null || a === undefined || a === '' ? null : Number(a);
  const nb = b === null || b === undefined || b === '' ? null : Number(b);
  if (na === null && nb === null) return true;
  if (na === null || nb === null) return false;
  if (!Number.isFinite(na) || !Number.isFinite(nb)) return false;
  return Math.abs(na - nb) <= 0.009;
}

/**
 * Igualdad de campos enteros (`null`/`undefined`/`''` cuentan como 0).
 * @param {*} a
 * @param {*} b
 * @returns {boolean}
 */
function mismoEntero(a, b) {
  const na = a === null || a === undefined || a === '' ? 0 : Math.trunc(Number(a));
  const nb = b === null || b === undefined || b === '' ? 0 : Math.trunc(Number(b));
  return na === nb;
}

/**
 * Igualdad de campos booleanos almacenados como 0/1.
 * @param {*} a
 * @param {*} b
 * @returns {boolean}
 */
function mismoBooleano(a, b) {
  return Boolean(Number(a ?? 0)) === Boolean(Number(b ?? 0));
}

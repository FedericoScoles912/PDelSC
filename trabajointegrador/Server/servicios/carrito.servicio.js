/**
 * @file Servicio del Carrito de Reposición sincronizado en tiempo real por servidor
 *       de negocio (`negocio_1`, `negocio_2`, etc.).
 *       Persiste cabecera e ítems en TiDB Cloud / MySQL para que todos los dispositivos
 *       (celular, tablet, computadora) conectados al mismo servidor vean y editen el
 *       mismo carrito en vivo.
 * @module Server/servicios/carrito.servicio
 */

import { conReintentos, getPool, normalizarIdNegocio, obtenerNegocioActual } from '../config/db.js';
import { ApiError } from '../utils/http.js';

/** @type {Promise<void>|null} */
let promesaTablasCarrito = null;

/**
 * Crea de forma idempotente las tablas `carrito_reposicion` y `carrito_reposicion_items`.
 * Al llevar columna `negocio_id`, funciona automáticamente para todos los servidores
 * de negocio (existentes y nuevos) sin requerir migraciones manuales.
 * @returns {Promise<void>}
 */
export async function asegurarTablasCarrito() {
  if (promesaTablasCarrito) {
    return promesaTablasCarrito;
  }

  promesaTablasCarrito = (async () => {
    const pool = getPool();

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS \`carrito_reposicion\` (
        \`negocio_id\`       VARCHAR(32)     NOT NULL,
        \`importador\`       VARCHAR(160)    NOT NULL DEFAULT '',
        \`email_importador\` VARCHAR(160)    NOT NULL DEFAULT '',
        \`notas\`            TEXT            NULL,
        \`version\`          BIGINT          NOT NULL DEFAULT 0,
        \`actualizado_por\`  BIGINT UNSIGNED NULL,
        \`actualizado_en\`   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`negocio_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS \`carrito_reposicion_items\` (
        \`id\`               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        \`negocio_id\`       VARCHAR(32)     NOT NULL,
        \`producto_id\`      BIGINT UNSIGNED NOT NULL DEFAULT 0,
        \`codigo\`           VARCHAR(64)     NOT NULL,
        \`categoria\`        VARCHAR(120)    NOT NULL DEFAULT 'General',
        \`medidas\`          VARCHAR(120)    NOT NULL DEFAULT '—',
        \`stock_actual\`     INT             NOT NULL DEFAULT 0,
        \`stock_minimo\`     INT             NOT NULL DEFAULT 0,
        \`faltante\`         INT             NOT NULL DEFAULT 0,
        \`cantidad\`         INT             NOT NULL DEFAULT 1,
        \`importador\`       VARCHAR(160)    NOT NULL DEFAULT '',
        \`email_importador\` VARCHAR(160)    NOT NULL DEFAULT '',
        \`agregado_en\`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`actualizado_en\`   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`uk_carrito_negocio_codigo\` (\`negocio_id\`, \`codigo\`),
        KEY \`ix_carrito_negocio\` (\`negocio_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);
  })().catch((err) => {
    promesaTablasCarrito = null;
    throw err;
  });

  return promesaTablasCarrito;
}

/**
 * Mapea una fila SQL de `carrito_reposicion_items` al formato JSON del cliente.
 * @param {Object} fila
 */
function mapearItem(fila) {
  return {
    producto_id: Number(fila.producto_id ?? 0),
    codigo: String(fila.codigo ?? ''),
    categoria: String(fila.categoria || 'General'),
    medidas: String(fila.medidas || '—'),
    stockActual: Number(fila.stock_actual ?? 0),
    stockMinimo: Number(fila.stock_minimo ?? 0),
    faltante: Number(fila.faltante ?? 0),
    cantidad: Math.max(1, Number(fila.cantidad ?? 1)),
    importador: String(fila.importador ?? ''),
    emailImportador: String(fila.email_importador ?? ''),
    agregadoEn: fila.agregado_en
      ? new Date(fila.agregado_en).toISOString()
      : new Date().toISOString()
  };
}

/**
 * Incrementa la versión del carrito para el negocio activo (creando la cabecera si no existe).
 * @param {import('mysql2/promise').Pool|import('mysql2/promise').PoolConnection} ejecutor
 * @param {string} negocioId
 * @param {number|null} usuarioId
 */
async function incrementarVersionCabecera(ejecutor, negocioId, usuarioId) {
  await ejecutor.execute(
    `INSERT INTO \`carrito_reposicion\` (\`negocio_id\`, \`version\`, \`actualizado_por\`)
     VALUES (?, 1, ?)
     ON DUPLICATE KEY UPDATE
       \`version\` = \`version\` + 1,
       \`actualizado_por\` = VALUES(\`actualizado_por\`)`,
    [negocioId, usuarioId ?? null]
  );
}

/**
 * Obtiene el estado completo del carrito del servidor de negocio activo.
 * @param {string} [negocioId]
 */
export async function obtenerCarrito(negocioId = obtenerNegocioActual()) {
  await asegurarTablasCarrito();
  const id = normalizarIdNegocio(negocioId);
  const pool = getPool();

  return conReintentos(async () => {
    const [[cabeceras], [items]] = await Promise.all([
      pool.execute(
        `SELECT \`importador\`, \`email_importador\`, \`notas\`, \`version\`, \`actualizado_en\`
           FROM \`carrito_reposicion\`
          WHERE \`negocio_id\` = ?
          LIMIT 1`,
        [id]
      ),
      pool.execute(
        `SELECT \`producto_id\`, \`codigo\`, \`categoria\`, \`medidas\`,
                \`stock_actual\`, \`stock_minimo\`, \`faltante\`, \`cantidad\`,
                \`importador\`, \`email_importador\`, \`agregado_en\`
           FROM \`carrito_reposicion_items\`
          WHERE \`negocio_id\` = ?
          ORDER BY \`id\` ASC`,
        [id]
      )
    ]);

    const cab = cabeceras?.[0] ?? null;
    return {
      negocioId: id,
      importador: String(cab?.importador ?? ''),
      emailImportador: String(cab?.email_importador ?? ''),
      notas: String(cab?.notas ?? ''),
      version: Number(cab?.version ?? 0),
      actualizadoEn: cab?.actualizado_en ? new Date(cab.actualizado_en).toISOString() : null,
      items: Array.isArray(items) ? items.map(mapearItem) : []
    };
  });
}

/**
 * Agrega un producto al carrito del negocio activo (o suma la cantidad si ya estaba cargado).
 * @param {Object} entrada
 * @param {number|null} [usuarioId]
 */
export async function agregarItemCarrito(entrada, usuarioId = null) {
  await asegurarTablasCarrito();
  const id = normalizarIdNegocio(obtenerNegocioActual());
  const codigo = String(entrada.codigo ?? '').trim();
  if (!codigo) {
    throw ApiError.solicitudInvalida('El código del producto es obligatorio.');
  }

  const productoId = Math.max(0, Math.round(Number(entrada.producto_id) || 0));
  const categoria = String(entrada.categoria || 'General').trim().slice(0, 120) || 'General';
  const medidas = String(entrada.medidas || '—').trim().slice(0, 120) || '—';
  const stockActual = Math.round(Number(entrada.stockActual) || 0);
  const stockMinimo = Math.round(Number(entrada.stockMinimo) || 0);
  const faltante = Math.max(
    0,
    Math.round(
      entrada.faltante !== undefined && entrada.faltante !== null
        ? Number(entrada.faltante)
        : Math.max(0, stockMinimo - stockActual)
    )
  );
  const cantidad = Math.max(1, Math.round(Number(entrada.cantidad) || 1));
  const importador = String(entrada.importador ?? '').trim().slice(0, 160);
  const emailImportador = String(entrada.emailImportador ?? '').trim().toLowerCase().slice(0, 160);

  const pool = getPool();

  await conReintentos(async () => {
    await pool.execute(
      `INSERT INTO \`carrito_reposicion_items\`
         (\`negocio_id\`, \`producto_id\`, \`codigo\`, \`categoria\`, \`medidas\`,
          \`stock_actual\`, \`stock_minimo\`, \`faltante\`, \`cantidad\`,
          \`importador\`, \`email_importador\`, \`agregado_en\`)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE
         \`producto_id\`      = IF(VALUES(\`producto_id\`) > 0, VALUES(\`producto_id\`), \`producto_id\`),
         \`categoria\`        = VALUES(\`categoria\`),
         \`medidas\`          = VALUES(\`medidas\`),
         \`stock_actual\`     = VALUES(\`stock_actual\`),
         \`stock_minimo\`     = VALUES(\`stock_minimo\`),
         \`faltante\`         = VALUES(\`faltante\`),
         \`cantidad\`         = \`cantidad\` + VALUES(\`cantidad\`),
         \`importador\`       = IF(VALUES(\`importador\`) <> '', VALUES(\`importador\`), \`importador\`),
         \`email_importador\` = IF(VALUES(\`email_importador\`) <> '', VALUES(\`email_importador\`), \`email_importador\`),
         \`agregado_en\`      = NOW()`,
      [
        id,
        productoId,
        codigo,
        categoria,
        medidas,
        stockActual,
        stockMinimo,
        faltante,
        cantidad,
        importador,
        emailImportador
      ]
    );

    await pool.execute(
      `INSERT INTO \`carrito_reposicion\`
         (\`negocio_id\`, \`importador\`, \`email_importador\`, \`version\`, \`actualizado_por\`)
       VALUES (?, ?, ?, 1, ?)
       ON DUPLICATE KEY UPDATE
         \`importador\`       = IF(VALUES(\`importador\`) <> '', VALUES(\`importador\`), \`importador\`),
         \`email_importador\` = IF(VALUES(\`email_importador\`) <> '', VALUES(\`email_importador\`), \`email_importador\`),
         \`version\`          = \`version\` + 1,
         \`actualizado_por\`  = VALUES(\`actualizado_por\`)`,
      [id, importador, emailImportador, usuarioId ?? null]
    );
  });

  return obtenerCarrito(id);
}

/**
 * Actualiza el importador, email de la importadora y/o las observaciones del carrito.
 * @param {{importador?:string, emailImportador?:string, notas?:string}} datos
 * @param {number|null} [usuarioId]
 */
export async function actualizarDatosCarrito(datos, usuarioId = null) {
  await asegurarTablasCarrito();
  const id = normalizarIdNegocio(obtenerNegocioActual());
  const pool = getPool();

  const tieneImportador = datos.importador !== undefined;
  const tieneEmail = datos.emailImportador !== undefined;
  const tieneNotas = datos.notas !== undefined;

  const importador = tieneImportador ? String(datos.importador ?? '').slice(0, 160) : '';
  const emailImportador = tieneEmail
    ? String(datos.emailImportador ?? '').trim().toLowerCase().slice(0, 160)
    : '';
  const notas = tieneNotas ? String(datos.notas ?? '').slice(0, 2000) : '';

  await conReintentos(async () => {
    await pool.execute(
      `INSERT INTO \`carrito_reposicion\`
         (\`negocio_id\`, \`importador\`, \`email_importador\`, \`notas\`, \`version\`, \`actualizado_por\`)
       VALUES (?, ?, ?, ?, 1, ?)
       ON DUPLICATE KEY UPDATE
         \`importador\`       = IF(? = 1, VALUES(\`importador\`), \`importador\`),
         \`email_importador\` = IF(? = 1, VALUES(\`email_importador\`), \`email_importador\`),
         \`notas\`            = IF(? = 1, VALUES(\`notas\`), \`notas\`),
         \`version\`          = \`version\` + 1,
         \`actualizado_por\`  = VALUES(\`actualizado_por\`)`,
      [
        id,
        importador,
        emailImportador,
        notas,
        usuarioId ?? null,
        tieneImportador ? 1 : 0,
        tieneEmail ? 1 : 0,
        tieneNotas ? 1 : 0
      ]
    );
  });

  return obtenerCarrito(id);
}

/**
 * Cambia la cantidad solicitada de un producto en el carrito (si es <= 0 lo quita).
 * @param {string} codigo
 * @param {number} nuevaCantidad
 * @param {number|null} [usuarioId]
 */
export async function cambiarCantidadItemCarrito(codigo, nuevaCantidad, usuarioId = null) {
  const codigoLimpio = String(codigo ?? '').trim();
  if (!codigoLimpio) {
    throw ApiError.solicitudInvalida('El código del producto es obligatorio.');
  }

  const cant = Math.round(Number(nuevaCantidad) || 0);
  if (cant <= 0) {
    return quitarItemCarrito(codigoLimpio, usuarioId);
  }

  await asegurarTablasCarrito();
  const id = normalizarIdNegocio(obtenerNegocioActual());
  const pool = getPool();

  await conReintentos(async () => {
    await pool.execute(
      `UPDATE \`carrito_reposicion_items\`
          SET \`cantidad\` = ?
        WHERE \`negocio_id\` = ? AND \`codigo\` = ?`,
      [cant, id, codigoLimpio]
    );
    await incrementarVersionCabecera(pool, id, usuarioId);
  });

  return obtenerCarrito(id);
}

/**
 * Quita un producto específico del carrito del negocio activo.
 * @param {string} codigo
 * @param {number|null} [usuarioId]
 */
export async function quitarItemCarrito(codigo, usuarioId = null) {
  const codigoLimpio = String(codigo ?? '').trim();
  if (!codigoLimpio) {
    throw ApiError.solicitudInvalida('El código del producto es obligatorio.');
  }

  await asegurarTablasCarrito();
  const id = normalizarIdNegocio(obtenerNegocioActual());
  const pool = getPool();

  await conReintentos(async () => {
    await pool.execute(
      `DELETE FROM \`carrito_reposicion_items\`
        WHERE \`negocio_id\` = ? AND \`codigo\` = ?`,
      [id, codigoLimpio]
    );
    await incrementarVersionCabecera(pool, id, usuarioId);
  });

  return obtenerCarrito(id);
}

/**
 * Vacía los ítems del carrito del negocio activo (conservando datos de importador).
 * @param {number|null} [usuarioId]
 */
export async function vaciarCarritoServidor(usuarioId = null) {
  await asegurarTablasCarrito();
  const id = normalizarIdNegocio(obtenerNegocioActual());
  const pool = getPool();

  await conReintentos(async () => {
    await pool.execute('DELETE FROM `carrito_reposicion_items` WHERE `negocio_id` = ?', [id]);
    await incrementarVersionCabecera(pool, id, usuarioId);
  });

  return obtenerCarrito(id);
}

/**
 * Sincroniza/migra un estado completo de carrito (útil para migración inicial desde
 * dispositivos que tenían productos cargados localmente antes de activar el sync).
 * @param {{importador?:string, emailImportador?:string, notas?:string, items?:Array<Object>}} datos
 * @param {number|null} [usuarioId]
 */
export async function sincronizarEstadoInicialCarrito(datos, usuarioId = null) {
  await asegurarTablasCarrito();
  const id = normalizarIdNegocio(obtenerNegocioActual());
  const actual = await obtenerCarrito(id);

  // Si el servidor ya tiene versión > 0, el servidor es la fuente de verdad.
  if (actual.version > 0 || actual.items.length > 0) {
    return actual;
  }

  const itemsEntrada = Array.isArray(datos.items) ? datos.items : [];
  for (const it of itemsEntrada) {
    if (!it?.codigo) continue;
    await agregarItemCarrito(
      {
        producto_id: it.producto_id,
        codigo: it.codigo,
        categoria: it.categoria,
        medidas: it.medidas,
        stockActual: it.stockActual,
        stockMinimo: it.stockMinimo,
        faltante: it.faltante,
        cantidad: it.cantidad,
        importador: it.importador || datos.importador || '',
        emailImportador: it.emailImportador || datos.emailImportador || ''
      },
      usuarioId
    );
  }

  if (datos.importador || datos.emailImportador || datos.notas) {
    await actualizarDatosCarrito(
      {
        importador: datos.importador ?? '',
        emailImportador: datos.emailImportador ?? '',
        notas: datos.notas ?? ''
      },
      usuarioId
    );
  }

  return obtenerCarrito(id);
}

/**
 * Calcula una firma determinística liviana del carrito para el motor de sincronización en vivo.
 * Permite que todos los dispositivos conectados al mismo negocio (incluso a través de nodos
 * distintos compartiendo TiDB Cloud) detecten cambios del carrito al instante.
 * @param {string} [negocioId]
 * @returns {Promise<string>}
 */
export async function obtenerFirmaCarrito(negocioId = obtenerNegocioActual()) {
  try {
    await asegurarTablasCarrito();
    const id = normalizarIdNegocio(negocioId);
    const pool = getPool();
    const [filas] = await pool.execute(
      `SELECT
         COALESCE((SELECT \`version\` FROM \`carrito_reposicion\` WHERE \`negocio_id\` = ?), 0) AS ver,
         COALESCE((SELECT CRC32(CONCAT_WS('|', COALESCE(\`importador\`,''), COALESCE(\`email_importador\`,''), COALESCE(\`notas\`,''))) FROM \`carrito_reposicion\` WHERE \`negocio_id\` = ?), 0) AS hdr_hash,
         COALESCE((SELECT COUNT(*) FROM \`carrito_reposicion_items\` WHERE \`negocio_id\` = ?), 0) AS cnt,
         COALESCE((SELECT SUM(\`cantidad\`) FROM \`carrito_reposicion_items\` WHERE \`negocio_id\` = ?), 0) AS qty,
         COALESCE((SELECT BIT_XOR(CRC32(CONCAT_WS('|', \`codigo\`, \`cantidad\`, COALESCE(\`importador\`,''), COALESCE(\`email_importador\`,'')))) FROM \`carrito_reposicion_items\` WHERE \`negocio_id\` = ?), 0) AS items_hash`,
      [id, id, id, id, id]
    );
    const f = filas?.[0];
    if (!f) return '0:0:0:0:0';
    return `${f.ver}:${f.hdr_hash}:${f.cnt}:${f.qty}:${f.items_hash}`;
  } catch {
    return '0:0:0:0:0';
  }
}

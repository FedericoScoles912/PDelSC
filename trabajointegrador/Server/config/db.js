/**
 * @file Pool de conexiones MySQL/TiDB con TLS, reintentos y transacciones.
 *       Reglas TiDB aplicadas:
 *        - TLS obligatorio (TLSv1.2+) con validación de certificado.
 *        - Pool con límite bajo para el plan gratuito + keepAlive y reconexión.
 *        - Reintentos con backoff ante conflictos de escritura (9007 / 8022) y
 *          bloqueos (1213 deadlock / 1205 wait timeout).
 * @module Server/config/db
 */

import { AsyncLocalStorage } from 'node:async_hooks';
import fs from 'node:fs';

import mysql from 'mysql2/promise';

import { env } from './env.js';

/** Contexto asíncrono para aislar cada servidor de negocio ("negocio_1", "negocio_2", etc.). */
const contextoNegocio = new AsyncLocalStorage();
const negociosInicializados = new Map();

const TABLAS_AISLABLES = [
  'categorias',
  'productos',
  'equivalencias',
  'movimientos_stock',
  'historial_precios',
  'usuarios',
  'proveedores_oauth',
  'refresh_tokens',
  'auditoria',
  'configuracion'
];

/** Normaliza el identificador del servidor de negocio. */
export function normalizarIdNegocio(id) {
  const limpio = String(id || 'negocio_1')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 28);
  return limpio || 'negocio_1';
}

/** Devuelve el identificador del servidor de negocio activo en el request actual. */
export function obtenerNegocioActual() {
  return contextoNegocio.getStore()?.negocioId || 'negocio_1';
}

/** Ejecuta una función dentro del contexto de un servidor de negocio específico. */
export function ejecutarEnContextoNegocio(negocioId, fn) {
  const id = normalizarIdNegocio(negocioId);
  return contextoNegocio.run({ negocioId: id }, fn);
}

/** Asegura que las tablas aisladas de un servidor de negocio secundario existan en la base. */
export async function asegurarEntornoNegocio(negocioId) {
  const id = normalizarIdNegocio(negocioId);
  if (id === 'negocio_1' || env.nodeEnv === 'test') return;

  if (negociosInicializados.has(id)) {
    await negociosInicializados.get(id);
    return;
  }

  const promesa = (async () => {
    const p = getPool();
    for (const tabla of TABLAS_AISLABLES) {
      const destino = `${tabla}__${id}`;
      await p.execute(`CREATE TABLE IF NOT EXISTS \`${destino}\` LIKE \`${tabla}\``);
    }

    // Sembrar usuarios base (administrador y roles operativos) y categorías si el negocio recién se crea
    const [uExistentes] = await p.execute(`SELECT COUNT(*) AS cnt FROM \`usuarios__${id}\``);
    if (Number(uExistentes?.[0]?.cnt ?? 0) === 0) {
      await p.execute(
        `INSERT IGNORE INTO \`usuarios__${id}\`
         SELECT * FROM \`usuarios\` WHERE \`rol_id\` = 1 OR \`activo\` = 1`
      );
    }

    const [cExistentes] = await p.execute(`SELECT COUNT(*) AS cnt FROM \`categorias__${id}\``);
    if (Number(cExistentes?.[0]?.cnt ?? 0) === 0) {
      await p.execute(`INSERT IGNORE INTO \`categorias__${id}\` SELECT * FROM \`categorias\``);
    }
  })().catch((err) => {
    negociosInicializados.delete(id);
    console.warn(`[db] No se pudo inicializar entorno de negocio ${id}:`, err?.message);
  });

  negociosInicializados.set(id, promesa);
  await promesa;
}

/** Reescribe las referencias a tablas y vistas SQL para el servidor de negocio activo. */
function reescribirSqlNegocio(sql) {
  const id = obtenerNegocioActual();
  if (id === 'negocio_1' || env.nodeEnv === 'test') return sql;

  let reescrito = sql;

  // Reemplazar vistas por subconsultas equivalentes sobre las tablas del negocio activo
  const subBajoMinimo = `(SELECT p.\`id\` AS \`producto_id\`, p.\`codigo\`, COALESCE(c.\`nombre\`, 'Sin categoría') AS \`categoria\`, p.\`eje_texto\` AS \`eje\`, p.\`aloj_texto\` AS \`aloj\`, p.\`alt_texto\` AS \`alt\`, p.\`stock\`, p.\`stock_minimo\`, GREATEST(p.\`stock_minimo\` - p.\`stock\`, 0) AS \`faltante\` FROM \`productos__${id}\` p LEFT JOIN \`categorias__${id}\` c ON c.\`id\` = p.\`categoria_id\` WHERE p.\`activo\` = 1 AND p.\`stock\` <= p.\`stock_minimo\`)`;
  const subStockActual = `(SELECT p.\`id\` AS \`producto_id\`, p.\`codigo\`, COALESCE(c.\`nombre\`, 'Sin categoría') AS \`categoria\`, p.\`eje_texto\` AS \`eje\`, p.\`aloj_texto\` AS \`aloj\`, p.\`alt_texto\` AS \`alt\`, p.\`stock\`, p.\`stock_minimo\`, (CASE WHEN p.\`stock\` <= p.\`stock_minimo\` THEN 1 ELSE 0 END) AS \`bajo_minimo\`, (p.\`stock\` * COALESCE(p.\`precio_lista\`, 0)) AS \`valor_stock\` FROM \`productos__${id}\` p LEFT JOIN \`categorias__${id}\` c ON c.\`id\` = p.\`categoria_id\` WHERE p.\`activo\` = 1)`;
  const subResumenCat = `(SELECT c.\`id\` AS \`categoria_id\`, c.\`nombre\` AS \`categoria\`, COUNT(p.\`id\`) AS \`total_productos\`, COALESCE(SUM(p.\`stock\`), 0) AS \`stock_total\`, COALESCE(SUM(p.\`stock\` * COALESCE(p.\`precio_lista\`, 0)), 0) AS \`valor_stock\`, COALESCE(SUM(CASE WHEN p.\`stock\` <= p.\`stock_minimo\` THEN 1 ELSE 0 END), 0) AS \`productos_bajo_minimo\` FROM \`categorias__${id}\` c LEFT JOIN \`productos__${id}\` p ON p.\`categoria_id\` = c.\`id\` AND p.\`activo\` = 1 WHERE c.\`activo\` = 1 GROUP BY c.\`id\`, c.\`nombre\`)`;

  reescrito = reescrito
    .replace(/`vw_productos_bajo_minimo`/g, `${subBajoMinimo} AS vw_bm`)
    .replace(/`vw_stock_actual`/g, `${subStockActual} AS vw_sa`)
    .replace(/`vw_resumen_categoria`/g, `${subResumenCat} AS vw_rc`);

  for (const tabla of TABLAS_AISLABLES) {
    const regex = new RegExp(`\`${tabla}\``, 'g');
    reescrito = reescrito.replace(regex, `\`${tabla}__${id}\``);
  }

  return reescrito;
}

/** Códigos de error que ameritan reintento. */
const CODIGOS_REINTENTABLES = new Set([
  '9007',      // TiDB: Write conflict
  '8022',      // TiDB: conflicto de transacción
  'ER_LOCK_DEADLOCK',   // 1213
  'ER_LOCK_WAIT_TIMEOUT', // 1205
  'PROTOCOL_CONNECTION_LOST',
  'ECONNRESET',
  'ETIMEDOUT'
]);

/** @type {import('mysql2/promise').Pool|null} */
let pool = null;

/**
 * Construye la configuración SSL de mysql2 según las variables de entorno.
 * @returns {Object|undefined}
 */
function configuracionSsl() {
  if (!env.db.ssl) return undefined;

  const ssl = { minVersion: 'TLSv1.2', rejectUnauthorized: true };
  if (env.db.sslCa && env.db.sslCaExiste) {
    ssl.ca = fs.readFileSync(env.db.sslCa);
  }
  return ssl;
}

/**
 * Devuelve (creando si hace falta) el pool de conexiones compartido.
 * @returns {import('mysql2/promise').Pool}
 */
export function getPool() {
  if (pool) return pool;

  pool = mysql.createPool({
    host: env.db.host,
    port: env.db.puerto,
    user: env.db.usuario,
    password: env.db.password,
    database: env.db.nombre,
    ssl: configuracionSsl(),
    waitForConnections: true,
    connectionLimit: env.db.limitePool,
    maxIdle: env.db.limitePool,
    idleTimeout: 45000,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    timezone: 'Z',
    charset: 'utf8mb4_general_ci',
    decimalNumbers: true,
    supportBigNumbers: true,
    bigNumberStrings: false,
    connectTimeout: 15000
  });

  // Reconexión ante cierre por inactividad del cluster TiDB.
  pool.on('connection', (conexion) => {
    conexion.on('error', (error) => {
      if (error?.fatal) {
        console.warn('[db] Conexión cerrada por el servidor:', error.code);
      }
    });
  });

  // Keep-alive periódico para evitar que TiDB Cloud Serverless cierre conexiones por inactividad.
  if (env.nodeEnv !== 'test') {
    setInterval(() => {
      if (!pool) return;
      pool.query('SELECT 1').catch(() => {});
    }, 45000).unref();
  }

  return pool;
}

/**
 * Ejecuta un SELECT parametrizado con reintento automático ante cortes de conexión.
 * @param {string} sql
 * @param {Array<*>} [parametros]
 * @returns {Promise<Array<Object>>}
 */
export async function query(sql, parametros = []) {
  const negocioId = obtenerNegocioActual();
  await asegurarEntornoNegocio(negocioId);
  const sqlEfectivo = reescribirSqlNegocio(sql);
  return conReintentos(async () => {
    const [filas] = await getPool().execute(sqlEfectivo, parametros);
    return filas;
  });
}

/**
 * Ejecuta un SELECT que devuelve la primera fila (o null).
 * @param {string} sql
 * @param {Array<*>} [parametros]
 * @returns {Promise<Object|null>}
 */
export async function queryUna(sql, parametros = []) {
  const filas = await query(sql, parametros);
  return filas[0] ?? null;
}

/**
 * Ejecuta una sentencia de escritura (INSERT/UPDATE/DELETE) con reintento automático.
 * @param {string} sql
 * @param {Array<*>} [parametros]
 * @returns {Promise<import('mysql2').ResultSetHeader>}
 */
export async function ejecutar(sql, parametros = []) {
  const negocioId = obtenerNegocioActual();
  await asegurarEntornoNegocio(negocioId);
  const sqlEfectivo = reescribirSqlNegocio(sql);
  return conReintentos(async () => {
    const [resultado] = await getPool().execute(sqlEfectivo, parametros);
    return resultado;
  });
}

/**
 * Reintenta una operación asíncrona con backoff exponencial + jitter.
 * @template T
 * @param {() => Promise<T>} operacion
 * @param {Object} [opciones]
 * @param {number} [opciones.intentos]
 * @param {number} [opciones.baseMs]
 * @returns {Promise<T>}
 */
export async function conReintentos(operacion, opciones = {}) {
  const intentos = opciones.intentos ?? 4;
  const baseMs = opciones.baseMs ?? 150;

  let ultimoError;
  for (let intento = 1; intento <= intentos; intento += 1) {
    try {
      return await operacion();
    } catch (error) {
      ultimoError = error;
      if (!CODIGOS_REINTENTABLES.has(error?.code) || intento === intentos) throw error;

      const espera = baseMs * 2 ** (intento - 1) + Math.floor(Math.random() * 50);
      await new Promise((resolver) => setTimeout(resolver, espera));
    }
  }
  throw ultimoError;
}

/**
 * Ejecuta una función dentro de una transacción, con commit/rollback automático.
 * @template T
 * @param {(conexion: import('mysql2/promise').PoolConnection) => Promise<T>} trabajo
 * @returns {Promise<T>}
 */
export async function conTransaccion(trabajo) {
  const negocioId = obtenerNegocioActual();
  await asegurarEntornoNegocio(negocioId);
  const conexion = await getPool().getConnection();
  const executeOriginal = conexion.execute.bind(conexion);
  conexion.execute = (sql, params) => executeOriginal(reescribirSqlNegocio(sql), params);
  try {
    await conexion.beginTransaction();
    const resultado = await trabajo(conexion);
    await conexion.commit();
    return resultado;
  } catch (error) {
    try {
      await conexion.rollback();
    } catch {
      // El rollback puede fallar si la conexión ya se cerró: se ignora.
    }
    throw error;
  } finally {
    conexion.execute = executeOriginal;
    conexion.release();
  }
}

/**
 * Verifica la conectividad con la base (útil para /health y arranque).
 * @param {number} [intentos]
 * @returns {Promise<{ok:boolean, version?:string, error?:string}>}
 */
export async function verificarConexion(intentos = 3) {
  try {
    const fila = await conReintentos(
      () => queryUna('SELECT VERSION() AS version'),
      { intentos, baseMs: 400 }
    );
    return { ok: true, version: fila?.version };
  } catch (error) {
    return { ok: false, error: `${error.code ?? ''} ${error.message}`.trim() };
  }
}

/**
 * Cierra el pool de forma ordenada (graceful shutdown).
 * @returns {Promise<void>}
 */
export async function cerrarPool() {
  if (!pool) return;
  const aCerrar = pool;
  pool = null;
  await aCerrar.end();
}

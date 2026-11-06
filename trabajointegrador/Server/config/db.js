/**
 * @file Pool de conexiones MySQL/TiDB con TLS, reintentos y transacciones.
 *       Reglas TiDB aplicadas:
 *        - TLS obligatorio (TLSv1.2+) con validación de certificado.
 *        - Pool con límite bajo para el plan gratuito + keepAlive y reconexión.
 *        - Reintentos con backoff ante conflictos de escritura (9007 / 8022) y
 *          bloqueos (1213 deadlock / 1205 wait timeout).
 * @module Server/config/db
 */

import fs from 'node:fs';

import mysql from 'mysql2/promise';

import { env } from './env.js';

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
  return conReintentos(async () => {
    const [filas] = await getPool().execute(sql, parametros);
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
  return conReintentos(async () => {
    const [resultado] = await getPool().execute(sql, parametros);
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
  const conexion = await getPool().getConnection();
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

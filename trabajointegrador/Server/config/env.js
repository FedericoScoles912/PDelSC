/**
 * @file Carga y validación centralizada de variables de entorno.
 *       Único punto de acceso a `process.env`: el resto del backend importa
 *       este objeto. Nunca se imprimen valores sensibles.
 * @module Server/config/env
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const raizProyecto = path.resolve(__dirname, '..', '..');

// Carga .env desde la raíz del proyecto (sin sobrescribir variables ya definidas).
dotenv.config({ path: path.join(raizProyecto, '.env') });

/**
 * Convierte un string de entorno en booleano.
 * @param {string|undefined} valor
 * @param {boolean} porDefecto
 * @returns {boolean}
 */
function aBooleano(valor, porDefecto = false) {
  if (valor === undefined || valor === '') return porDefecto;
  return ['1', 'true', 'yes', 'si', 'sí', 'on'].includes(String(valor).toLowerCase());
}

/**
 * Convierte un string de entorno en entero.
 * @param {string|undefined} valor
 * @param {number} porDefecto
 * @returns {number}
 */
function aEntero(valor, porDefecto) {
  const numero = Number.parseInt(valor ?? '', 10);
  return Number.isFinite(numero) ? numero : porDefecto;
}

/**
 * Convierte una lista separada por comas en array de strings.
 * @param {string|undefined} valor
 * @param {string[]} porDefecto
 * @returns {string[]}
 */
function aLista(valor, porDefecto = []) {
  if (!valor) return porDefecto;
  return valor
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

const dbSslActivado = aBooleano(process.env.DB_SSL, true);
const rutaCa = process.env.DB_SSL_CA ? path.resolve(raizProyecto, process.env.DB_SSL_CA) : null;

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  esProduccion: (process.env.NODE_ENV ?? 'development') === 'production',
  puerto: aEntero(process.env.PORT, 4000),
  apiPrefix: process.env.API_PREFIX ?? '/api/v1',
  raizProyecto,

  db: {
    host: process.env.DB_HOST ?? '',
    puerto: aEntero(process.env.DB_PORT, 4000),
    usuario: process.env.DB_USER ?? '',
    password: process.env.DB_PASSWORD ?? '',
    nombre: process.env.DB_NAME ?? 'retenes_stock',
    ssl: dbSslActivado,
    sslCa: rutaCa,
    sslCaExiste: Boolean(rutaCa && fs.existsSync(rutaCa)),
    limitePool: aEntero(process.env.DB_POOL_LIMIT, 5)
  },

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? '',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? '',
    accessExpira: process.env.JWT_ACCESS_EXPIRES ?? '15m',
    refreshExpira: process.env.JWT_REFRESH_EXPIRES ?? '7d'
  },

  cors: {
    origenes: aLista(process.env.CORS_ORIGINS ?? process.env.CORS_ORIGIN, [
      'http://localhost:8081',
      'http://localhost:19006'
    ])
  },

  rateLimit: {
    ventanaMs: aEntero(process.env.RATE_LIMIT_WINDOW_MS, 900000),
    maximo: aEntero(process.env.RATE_LIMIT_MAX, 300)
  },

  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? ''
    },
    facebook: {
      clientId: process.env.FACEBOOK_CLIENT_ID ?? '',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET ?? ''
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID ?? '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? ''
    },
    callbackBaseUrl: process.env.OAUTH_CALLBACK_BASE_URL ?? 'http://localhost:4000'
  },

  mail: {
    appsScriptUrl: process.env.APPS_SCRIPT_MAIL_URL ?? '',
    appsScriptSecret: process.env.APPS_SCRIPT_MAIL_SECRET ?? ''
  },

  importacion: {
    excelPath: process.env.EXCEL_PATH ?? './imports/Retenes_EMIC__Lista_de_Precios_-_Vigencia_01_Nov_2025.xlsx',
    logDir: process.env.IMPORT_LOG_DIR ?? './imports/logs'
  }
};

/**
 * Valida que las variables críticas estén presentes.
 * @returns {string[]} Lista de problemas detectados (vacía si todo OK).
 */
export function validarEntorno() {
  const problemas = [];

  if (!env.db.host) problemas.push('Falta DB_HOST');
  if (!env.db.usuario) problemas.push('Falta DB_USER');
  if (env.db.password === '') problemas.push('Falta DB_PASSWORD');
  if (!env.db.nombre) problemas.push('Falta DB_NAME');
  if (!env.jwt.accessSecret) problemas.push('Falta JWT_ACCESS_SECRET');
  if (!env.jwt.refreshSecret) problemas.push('Falta JWT_REFRESH_SECRET');

  if (env.esProduccion) {
    if (env.jwt.accessSecret.length < 32) problemas.push('JWT_ACCESS_SECRET es muy corto para producción (mínimo 32 caracteres)');
    if (env.jwt.refreshSecret.length < 32) problemas.push('JWT_REFRESH_SECRET es muy corto para producción (mínimo 32 caracteres)');
    if (env.cors.origenes.includes('*')) problemas.push('CORS_ORIGINS no puede ser "*" en producción');
  }

  return problemas;
}

/**
 * Resuelve una ruta relativa a la raíz del proyecto.
 * @param {string} ruta
 * @returns {string}
 */
export function resolverRuta(ruta) {
  return path.isAbsolute(ruta) ? ruta : path.resolve(raizProyecto, ruta);
}

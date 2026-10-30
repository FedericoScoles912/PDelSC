/**
 * @file Firma/verificación de JWT (access + refresh) y utilidades de hash.
 *       El refresh token se guarda en la base sólo como SHA-256 (nunca en claro).
 * @module Server/utils/jwt
 */

import crypto from 'node:crypto';

import jwt from 'jsonwebtoken';

import { env } from '../config/env.js';

/** Unidades soportadas para expresiones de duración ('15m', '7d', '2h', '30s'). */
const UNIDADES_MS = { s: 1000, m: 60000, h: 3600000, d: 86400000 };

/**
 * Convierte una expresión de duración ('15m', '7d') a milisegundos.
 * @param {string} expresion
 * @returns {number}
 */
export function duracionAMs(expresion) {
  const coincidencia = /^(\d+)\s*([smhd])$/i.exec(String(expresion).trim());
  if (!coincidencia) {
    const numero = Number(expresion);
    return Number.isFinite(numero) ? numero * 1000 : 0;
  }
  const [, cantidad, unidad] = coincidencia;
  return Number(cantidad) * UNIDADES_MS[unidad.toLowerCase()];
}

/**
 * Firma un token de acceso.
 * @param {{sub:(number|string), rol:string, email:string, nombre?:string}} payload
 * @returns {string}
 */
export function firmarAccess(payload) {
  return jwt.sign(payload, env.jwt.accessSecret, { expiresIn: env.jwt.accessExpira });
}

/**
 * Firma un token de refresco.
 * @param {{sub:(number|string), jti:string}} payload
 * @returns {string}
 */
export function firmarRefresh(payload) {
  return jwt.sign(payload, env.jwt.refreshSecret, { expiresIn: env.jwt.refreshExpira });
}

/**
 * Verifica un token de acceso.
 * @param {string} token
 * @returns {Object} Payload decodificado.
 */
export function verificarAccess(token) {
  return jwt.verify(token, env.jwt.accessSecret);
}

/**
 * Verifica un token de refresco.
 * @param {string} token
 * @returns {Object} Payload decodificado.
 */
export function verificarRefresh(token) {
  return jwt.verify(token, env.jwt.refreshSecret);
}

/**
 * Hash SHA-256 (hex) de un token, para almacenarlo sin exponerlo.
 * @param {string} token
 * @returns {string}
 */
export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Fecha de expiración del refresh token.
 * @returns {Date}
 */
export function expiracionRefresh() {
  return new Date(Date.now() + duracionAMs(env.jwt.refreshExpira));
}

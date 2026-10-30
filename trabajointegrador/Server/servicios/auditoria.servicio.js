/**
 * @file Registro de auditoría. Nunca interrumpe la operación principal:
 *       si falla el insert, sólo se deja una advertencia en consola.
 * @module Server/servicios/auditoria
 */

import { ejecutar, query, queryUna } from '../config/db.js';
import { clausulaLimite, leerPaginacion, metaPaginacion } from '../utils/paginacion.js';

/**
 * Registra una acción en la tabla `auditoria`.
 * @param {Object} entrada
 * @param {number|null} [entrada.usuarioId]
 * @param {string} entrada.accion  'crear' | 'actualizar' | 'eliminar' | 'login' | 'importar' | 'movimiento' | ...
 * @param {string} entrada.entidad 'producto' | 'usuario' | 'categoria' | 'movimiento' | 'import' | 'auth' | ...
 * @param {(string|number|null)} [entrada.entidadId]
 * @param {Object|null} [entrada.detalle]
 * @param {string|null} [entrada.ip]
 * @returns {Promise<void>}
 */
export async function registrar(entrada) {
  const {
    usuarioId = null,
    accion,
    entidad,
    entidadId = null,
    detalle = null,
    ip = null
  } = entrada;

  try {
    await ejecutar(
      `INSERT INTO \`auditoria\` (\`usuario_id\`, \`accion\`, \`entidad\`, \`entidad_id\`, \`detalle\`, \`ip\`)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        usuarioId,
        accion,
        entidad,
        entidadId === null ? null : String(entidadId),
        detalle ? JSON.stringify(detalle) : null,
        ip
      ]
    );
  } catch (error) {
    console.warn('[auditoria] No se pudo registrar la acción:', error.code ?? error.message);
  }
}

/**
 * Obtiene la IP del cliente a partir del request.
 * @param {import('express').Request} req
 * @returns {string|null}
 */
export function ipDe(req) {
  const reenviada = req.headers['x-forwarded-for'];
  if (typeof reenviada === 'string' && reenviada.length) return reenviada.split(',')[0].trim();
  return req.ip ?? null;
}

/**
 * Lista registros de auditoría con filtros y paginación (panel de Administrador).
 * @param {Object} filtros
 * @returns {Promise<{datos:Array<Object>, meta:Object}>}
 */
export async function listar(filtros = {}) {
  const { pagina, limite, offset } = leerPaginacion(filtros, { limiteDef: 30, limiteMax: 200 });

  const condiciones = [];
  const parametros = [];

  if (filtros.usuario_id) {
    condiciones.push('a.`usuario_id` = ?');
    parametros.push(filtros.usuario_id);
  }
  if (filtros.entidad) {
    condiciones.push('a.`entidad` = ?');
    parametros.push(filtros.entidad);
  }
  if (filtros.accion) {
    condiciones.push('a.`accion` = ?');
    parametros.push(filtros.accion);
  }
  if (filtros.desde) {
    condiciones.push('a.`creado_en` >= ?');
    parametros.push(filtros.desde);
  }
  if (filtros.hasta) {
    condiciones.push('a.`creado_en` <= ?');
    parametros.push(filtros.hasta);
  }

  const donde = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';

  const totalFila = await queryUna(
    `SELECT COUNT(*) AS total FROM \`auditoria\` a ${donde}`,
    parametros
  );

  const datos = await query(
    `SELECT a.\`id\`, a.\`usuario_id\`, a.\`accion\`, a.\`entidad\`, a.\`entidad_id\`,
            a.\`detalle\`, a.\`ip\`, a.\`creado_en\`,
            CONCAT(u.\`nombre\`, ' ', COALESCE(u.\`apellido\`, '')) AS usuario_nombre,
            u.\`email\` AS usuario_email
       FROM \`auditoria\` a
       LEFT JOIN \`usuarios\` u ON u.\`id\` = a.\`usuario_id\`
       ${donde}
       ORDER BY a.\`creado_en\` DESC, a.\`id\` DESC
       ${clausulaLimite(limite, offset)}`,
    parametros
  );

  return { datos, meta: metaPaginacion(totalFila?.total ?? 0, pagina, limite) };
}

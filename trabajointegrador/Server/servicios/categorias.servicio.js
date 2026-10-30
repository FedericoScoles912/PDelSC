/**
 * @file Servicio de categorías: CRUD, conteo de productos y slug.
 * @module Server/servicios/categorias
 */

import { ejecutar, query, queryUna } from '../config/db.js';
import { ApiError } from '../utils/http.js';

/**
 * Genera un slug a partir de un texto (minúsculas, sin tildes, guiones).
 * @param {string} texto
 * @returns {string}
 */
function slugificar(texto) {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Lista categorías con el conteo de productos asociados.
 * @param {Object} [filtros]
 * @param {boolean} [filtros.incluirInactivas]
 * @returns {Promise<Array<Object>>}
 */
export async function listar({ incluirInactivas = false } = {}) {
  const donde = incluirInactivas ? '' : 'WHERE c.`activo` = 1';

  return query(
    `SELECT c.\`id\`, c.\`nombre\`, c.\`slug\`, c.\`orden\`, c.\`activo\`,
            c.\`creado_en\`, c.\`actualizado_en\`,
            COUNT(p.\`id\`) AS total_productos
       FROM \`categorias\` c
       LEFT JOIN \`productos\` p ON p.\`categoria_id\` = c.\`id\`
       ${donde}
       GROUP BY c.\`id\`
       ORDER BY c.\`orden\` ASC, c.\`nombre\` ASC`
  );
}

/**
 * Obtiene una categoría por su id.
 * @param {number} id
 * @returns {Promise<Object>}
 */
export async function obtener(id) {
  const fila = await queryUna(
    `SELECT \`id\`, \`nombre\`, \`slug\`, \`orden\`, \`activo\`, \`creado_en\`, \`actualizado_en\`
       FROM \`categorias\`
      WHERE \`id\` = ?`,
    [id]
  );

  if (!fila) throw ApiError.noEncontrado('Categoría no encontrada.');
  return fila;
}

/**
 * Crea una categoría calculando el slug desde el nombre.
 * @param {Object} datos
 * @param {string} datos.nombre
 * @param {number} [datos.orden]
 * @returns {Promise<Object>}
 */
export async function crear({ nombre, orden = 0 } = {}) {
  const existente = await queryUna('SELECT `id` FROM `categorias` WHERE `nombre` = ?', [nombre]);
  if (existente) throw ApiError.conflicto('Ya existe una categoría con ese nombre.');

  const resultado = await ejecutar(
    'INSERT INTO `categorias` (`nombre`, `slug`, `orden`) VALUES (?, ?, ?)',
    [nombre, slugificar(nombre), orden]
  );

  return obtener(resultado.insertId);
}

/**
 * Actualiza nombre, orden y/o estado activo de una categoría.
 * @param {number} id
 * @param {Object} datos
 * @param {string} [datos.nombre]
 * @param {number} [datos.orden]
 * @param {boolean} [datos.activo]
 * @returns {Promise<Object>}
 */
export async function actualizar(id, { nombre, orden, activo } = {}) {
  const actual = await queryUna('SELECT `id`, `nombre` FROM `categorias` WHERE `id` = ?', [id]);
  if (!actual) throw ApiError.noEncontrado('Categoría no encontrada.');

  const asignaciones = [];
  const parametros = [];

  if (nombre !== undefined) {
    if (nombre !== actual.nombre) {
      const duplicado = await queryUna(
        'SELECT `id` FROM `categorias` WHERE `nombre` = ? AND `id` <> ?',
        [nombre, id]
      );
      if (duplicado) throw ApiError.conflicto('Ya existe una categoría con ese nombre.');
    }
    asignaciones.push('`nombre` = ?', '`slug` = ?');
    parametros.push(nombre, slugificar(nombre));
  }

  if (orden !== undefined) {
    asignaciones.push('`orden` = ?');
    parametros.push(orden);
  }

  if (activo !== undefined) {
    asignaciones.push('`activo` = ?');
    parametros.push(activo ? 1 : 0);
  }

  if (asignaciones.length) {
    parametros.push(id);
    await ejecutar(`UPDATE \`categorias\` SET ${asignaciones.join(', ')} WHERE \`id\` = ?`, parametros);
  }

  return obtener(id);
}

/**
 * Elimina físicamente una categoría si no tiene productos asociados.
 * @param {number} id
 * @returns {Promise<{id:number}>}
 */
export async function eliminar(id) {
  const categoria = await queryUna('SELECT `id` FROM `categorias` WHERE `id` = ?', [id]);
  if (!categoria) throw ApiError.noEncontrado('Categoría no encontrada.');

  const conteo = await queryUna(
    'SELECT COUNT(*) AS total FROM `productos` WHERE `categoria_id` = ?',
    [id]
  );
  if ((conteo?.total ?? 0) > 0) {
    throw ApiError.conflicto('No se puede eliminar: la categoría tiene productos.');
  }

  await ejecutar('DELETE FROM `categorias` WHERE `id` = ?', [id]);
  return { id };
}

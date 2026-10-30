/**
 * @file Gestión de usuarios y roles (uso exclusivo del Administrador).
 * @module Server/servicios/usuarios
 */

import bcrypt from 'bcryptjs';

import { ejecutar, query, queryUna } from '../config/db.js';
import { ApiError } from '../utils/http.js';
import { clausulaLimite, leerPaginacion, metaPaginacion } from '../utils/paginacion.js';

/** Columnas del usuario junto a su rol (nunca incluye `password_hash`). */
const SELECT_USUARIO = `
  SELECT u.\`id\`, u.\`email\`, u.\`nombre\`, u.\`apellido\`, u.\`telefono\`,
         u.\`activo\`, u.\`email_verificado\`, u.\`ultimo_login_en\`, u.\`creado_en\`,
         r.\`id\` AS rol_id, r.\`codigo\` AS rol_codigo, r.\`nombre\` AS rol_nombre
    FROM \`usuarios\` u
    JOIN \`roles\` r ON r.\`id\` = u.\`rol_id\``;

/**
 * Lista los roles disponibles.
 * @returns {Promise<Array<Object>>}
 */
export async function listarRoles() {
  return query(
    'SELECT `id`, `codigo`, `nombre`, `descripcion` FROM `roles` ORDER BY `codigo` ASC'
  );
}

/**
 * Lista usuarios con filtros y paginación.
 * @param {{q?:string, rol?:string, activo?:(number|string), pagina?:(number|string), limite?:(number|string)}} filtros
 * @returns {Promise<{datos:Array<Object>, meta:Object}>}
 */
export async function listar(filtros = {}) {
  const { pagina, limite, offset } = leerPaginacion(filtros, { limiteDef: 20, limiteMax: 100 });

  const condiciones = [];
  const parametros = [];

  if (filtros.q) {
    const patron = `%${filtros.q}%`;
    condiciones.push('(u.`nombre` LIKE ? OR u.`apellido` LIKE ? OR u.`email` LIKE ?)');
    parametros.push(patron, patron, patron);
  }
  if (filtros.rol) {
    condiciones.push('r.`codigo` = ?');
    parametros.push(filtros.rol);
  }
  if (filtros.activo !== undefined && filtros.activo !== null && filtros.activo !== '') {
    condiciones.push('u.`activo` = ?');
    parametros.push(Number(filtros.activo) ? 1 : 0);
  }

  const donde = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';

  const totalFila = await queryUna(
    `SELECT COUNT(*) AS total FROM \`usuarios\` u JOIN \`roles\` r ON r.\`id\` = u.\`rol_id\` ${donde}`,
    parametros
  );

  const datos = await query(
    `${SELECT_USUARIO}
     ${donde}
     ORDER BY u.\`creado_en\` DESC, u.\`id\` DESC
     ${clausulaLimite(limite, offset)}`,
    parametros
  );

  return { datos, meta: metaPaginacion(totalFila?.total ?? 0, pagina, limite) };
}

/**
 * Obtiene un usuario por id.
 * @param {number|string} id
 * @returns {Promise<Object>}
 */
export async function obtener(id) {
  const fila = await queryUna(`${SELECT_USUARIO} WHERE u.\`id\` = ?`, [id]);
  if (!fila) throw ApiError.noEncontrado('Usuario no encontrado.');
  return fila;
}

/**
 * Crea un usuario.
 * @param {{rol:string, email:string, password:string, nombre:string, apellido?:(string|null), telefono?:(string|null), activo?:boolean}} datos
 * @returns {Promise<Object>}
 */
export async function crear({
  rol,
  email,
  password,
  nombre,
  apellido = null,
  telefono = null,
  activo = true
}) {
  const rolFila = await queryUna('SELECT `id` FROM `roles` WHERE `codigo` = ?', [rol]);
  if (!rolFila) throw ApiError.solicitudInvalida('El rol indicado no existe.');

  const hash = await bcrypt.hash(password, 10);
  const resultado = await ejecutar(
    `INSERT INTO \`usuarios\` (\`rol_id\`, \`email\`, \`password_hash\`, \`nombre\`, \`apellido\`, \`telefono\`, \`activo\`, \`email_verificado\`)
     VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
    [rolFila.id, email, hash, nombre, apellido, telefono, activo ? 1 : 0]
  );

  return obtener(resultado.insertId);
}

/**
 * Actualiza un usuario. No permite cambiar el email.
 * @param {number|string} id
 * @param {{nombre?:string, apellido?:string, telefono?:string, rol?:string, activo?:boolean, password?:string}} datos
 * @returns {Promise<Object>}
 */
export async function actualizar(id, datos = {}) {
  const { nombre, apellido, telefono, rol, activo, password } = datos;
  const asignaciones = [];
  const parametros = [];

  if (nombre !== undefined) {
    asignaciones.push('`nombre` = ?');
    parametros.push(nombre);
  }
  if (apellido !== undefined) {
    asignaciones.push('`apellido` = ?');
    parametros.push(apellido);
  }
  if (telefono !== undefined) {
    asignaciones.push('`telefono` = ?');
    parametros.push(telefono);
  }
  if (activo !== undefined) {
    asignaciones.push('`activo` = ?');
    parametros.push(activo ? 1 : 0);
  }
  if (password !== undefined && password !== null && password !== '') {
    asignaciones.push('`password_hash` = ?');
    parametros.push(await bcrypt.hash(password, 10));
  }
  if (rol !== undefined) {
    const rolFila = await queryUna('SELECT `id` FROM `roles` WHERE `codigo` = ?', [rol]);
    if (!rolFila) throw ApiError.solicitudInvalida('El rol indicado no existe.');
    asignaciones.push('`rol_id` = ?');
    parametros.push(rolFila.id);
  }

  if (asignaciones.length) {
    parametros.push(id);
    await ejecutar(`UPDATE \`usuarios\` SET ${asignaciones.join(', ')} WHERE \`id\` = ?`, parametros);
  }

  return obtener(id);
}

/**
 * Activa o desactiva un usuario.
 * @param {number|string} id
 * @param {boolean} activo
 * @returns {Promise<Object>}
 */
export async function cambiarActivo(id, activo) {
  await ejecutar('UPDATE `usuarios` SET `activo` = ? WHERE `id` = ?', [activo ? 1 : 0, id]);
  return obtener(id);
}

/**
 * Desactiva un usuario (no se borra físicamente por las referencias existentes).
 * @param {number|string} id
 * @param {number|string} usuarioActualId
 * @returns {Promise<{id:number, activo:number}>}
 */
export async function eliminar(id, usuarioActualId) {
  if (Number(id) === Number(usuarioActualId)) {
    throw ApiError.solicitudInvalida('No podés desactivar tu propio usuario.');
  }

  await ejecutar('UPDATE `usuarios` SET `activo` = 0 WHERE `id` = ?', [id]);
  return { id: Number(id), activo: 0 };
}

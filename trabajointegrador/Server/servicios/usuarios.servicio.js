/**
 * @file Gestión de usuarios y roles (uso exclusivo del Administrador).
 * @module Server/servicios/usuarios
 */

import bcrypt from 'bcryptjs';

import { ejecutar, query, queryUna } from '../config/db.js';
import { ApiError } from '../utils/http.js';
import { clausulaLimite, leerPaginacion, metaPaginacion } from '../utils/paginacion.js';
import { asegurarColumnaAprobacion } from './auth.servicio.js';

/** Columnas del usuario junto a su rol (nunca incluye `password_hash`). */
const SELECT_USUARIO = `
  SELECT u.\`id\`, u.\`email\`, u.\`nombre\`, u.\`apellido\`, u.\`telefono\`,
         u.\`activo\`, u.\`estado_aprobacion\`, u.\`email_verificado\`, u.\`ultimo_login_en\`, u.\`creado_en\`,
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
  await asegurarColumnaAprobacion();
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
     ORDER BY u.\`activo\` ASC, u.\`creado_en\` DESC, u.\`id\` DESC
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
  await asegurarColumnaAprobacion();
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
  await asegurarColumnaAprobacion();
  const rolFila = await queryUna('SELECT `id` FROM `roles` WHERE `codigo` = ?', [rol]);
  if (!rolFila) throw ApiError.solicitudInvalida('El rol indicado no existe.');

  const hash = await bcrypt.hash(password, 10);
  const resultado = await ejecutar(
    `INSERT INTO \`usuarios\` (\`rol_id\`, \`email\`, \`password_hash\`, \`nombre\`, \`apellido\`, \`telefono\`, \`activo\`, \`estado_aprobacion\`, \`email_verificado\`)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
    [rolFila.id, email, hash, nombre, apellido, telefono, activo ? 1 : 0, activo ? 'aprobado' : 'pendiente']
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
  const { email, nombre, apellido, telefono, rol, activo, password } = datos;
  const asignaciones = [];
  const parametros = [];

  if (email !== undefined) {
    const emailLimpio = email.trim().toLowerCase();
    const existente = await queryUna(
      'SELECT `id` FROM `usuarios` WHERE `email` = ? AND `id` <> ?',
      [emailLimpio, id]
    );
    if (existente) {
      throw ApiError.conflicto('Ya existe otro usuario con ese correo electrónico.');
    }
    asignaciones.push('`email` = ?');
    parametros.push(emailLimpio);
  }
  if (nombre !== undefined) {
    asignaciones.push('`nombre` = ?');
    parametros.push(nombre.trim());
  }
  if (apellido !== undefined) {
    asignaciones.push('`apellido` = ?');
    parametros.push(apellido && apellido.trim() !== '' ? apellido.trim() : null);
  }
  if (telefono !== undefined) {
    asignaciones.push('`telefono` = ?');
    parametros.push(telefono && telefono.trim() !== '' ? telefono.trim() : null);
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
  await asegurarColumnaAprobacion();
  await ejecutar(
    'UPDATE `usuarios` SET `activo` = ?, `estado_aprobacion` = ? WHERE `id` = ?',
    [activo ? 1 : 0, activo ? 'aprobado' : 'desactivado', id]
  );
  return obtener(id);
}

/**
 * Elimina físicamente un usuario de la base de datos (uso exclusivo del Administrador),
 * limpiando sus tokens/vinculaciones OAuth y desvinculando referencias históricas.
 * @param {number|string} id
 * @param {number|string} usuarioActualId
 * @returns {Promise<{id:number, email:string, eliminado:boolean}>}
 */
export async function eliminar(id, usuarioActualId) {
  const idNum = Number(id);
  if (idNum === Number(usuarioActualId)) {
    throw ApiError.solicitudInvalida('No podés eliminar tu propia cuenta activa.');
  }

  const actual = await queryUna(
    'SELECT `id`, `email`, `nombre`, `apellido` FROM `usuarios` WHERE `id` = ?',
    [idNum]
  );
  if (!actual) {
    throw ApiError.noEncontrado('Usuario no encontrado.');
  }

  await ejecutar('DELETE FROM `proveedores_oauth` WHERE `usuario_id` = ?', [idNum]);
  await ejecutar('DELETE FROM `refresh_tokens` WHERE `usuario_id` = ?', [idNum]);
  await ejecutar('UPDATE `movimientos_stock` SET `usuario_id` = NULL WHERE `usuario_id` = ?', [idNum]);
  await ejecutar('UPDATE `historial_precios` SET `usuario_id` = NULL WHERE `usuario_id` = ?', [idNum]);
  await ejecutar('UPDATE `auditoria` SET `usuario_id` = NULL WHERE `usuario_id` = ?', [idNum]);
  await ejecutar('DELETE FROM `usuarios` WHERE `id` = ?', [idNum]);

  return {
    id: idNum,
    email: actual.email,
    eliminado: true
  };
}

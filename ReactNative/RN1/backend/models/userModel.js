import { pool } from '../config/db.js';

/**
 * Modelo de Usuario para operaciones en la base de datos MySQL.
 * Todas las consultas están parametrizadas para prevenir inyección SQL.
 */
export const UserModel = {
  /**
   * Busca un usuario por nombre de usuario o por correo electrónico.
   * @param {string} identificador - Nombre de usuario o correo electrónico
   * @returns {Promise<Object|null>} Registro del usuario con password_hash o null si no existe
   */
  async findByUsuarioOrCorreo(identificador) {
    const query = `
      SELECT id, nombre, correo, usuario, password_hash, rol, creado_en
      FROM usuarios
      WHERE usuario = ? OR correo = ?
      LIMIT 1
    `;
    const [rows] = await pool.execute(query, [identificador, identificador]);
    return rows.length > 0 ? rows[0] : null;
  },

  /**
   * Busca un usuario por su ID primario.
   * @param {number|string} id - Identificador numérico del usuario
   * @returns {Promise<Object|null>} Datos seguros del usuario (sin password_hash)
   */
  async findById(id) {
    const query = `
      SELECT id, nombre, correo, usuario, rol, creado_en
      FROM usuarios
      WHERE id = ?
      LIMIT 1
    `;
    const [rows] = await pool.execute(query, [id]);
    return rows.length > 0 ? rows[0] : null;
  },
};

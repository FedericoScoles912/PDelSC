/**
 * oauthRepo.js
 * Persistencia de identidades de proveedores sociales.
 */
import { query } from '../config/db.js';

export const findByProvider = async (proveedor, providerUserId) => {
  const rows = await query(
    `SELECT * FROM proveedores_oauth WHERE proveedor = :proveedor AND provider_user_id = :providerUserId LIMIT 1`,
    { proveedor, providerUserId },
  );
  return rows[0] || null;
};

export const link = async ({ usuarioId, proveedor, providerUserId, emailProveedor }) => {
  const result = await query(
    `INSERT INTO proveedores_oauth (usuario_id, proveedor, provider_user_id, email_proveedor)
     VALUES (:usuarioId, :proveedor, :providerUserId, :emailProveedor)`,
    { usuarioId, proveedor, providerUserId, emailProveedor },
  );
  return result.insertId;
};

export default { findByProvider, link };

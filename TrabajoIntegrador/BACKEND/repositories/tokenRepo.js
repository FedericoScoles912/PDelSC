/**
 * tokenRepo.js
 * Persistencia de refresh tokens (hasheados) para rotación y revocación.
 */
import { query } from '../config/db.js';

export const save = async ({ usuarioId, tokenHash, expiraEn, ip, userAgent }) => {
  const result = await query(
    `INSERT INTO refresh_tokens (usuario_id, token_hash, expira_en, ip, user_agent)
     VALUES (:usuarioId, :tokenHash, :expiraEn, :ip, :userAgent)`,
    { usuarioId, tokenHash, expiraEn, ip, userAgent },
  );
  return result.insertId;
};

export const findByHash = async (tokenHash) => {
  const rows = await query(`SELECT * FROM refresh_tokens WHERE token_hash = :tokenHash LIMIT 1`, { tokenHash });
  return rows[0] || null;
};

export const revoke = async (id, reemplazadoPorId = null) => {
  await query(
    `UPDATE refresh_tokens SET revocado = 1, reemplazado_por_id = :reemplazadoPorId WHERE id = :id`,
    { id, reemplazadoPorId },
  );
};

export const revokeAllForUser = async (usuarioId) => {
  await query(`UPDATE refresh_tokens SET revocado = 1 WHERE usuario_id = :usuarioId AND revocado = 0`, { usuarioId });
};

export const deleteExpired = async () => {
  await query(`DELETE FROM refresh_tokens WHERE expira_en < NOW() OR revocado = 1`);
};

export default { save, findByHash, revoke, revokeAllForUser, deleteExpired };

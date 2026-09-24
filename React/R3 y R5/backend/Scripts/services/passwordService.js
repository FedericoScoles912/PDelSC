import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

/**
 * Genera un hash bcrypt para la contraseña en texto plano.
 * @param {string} plainPassword - Contraseña en texto plano
 * @returns {Promise<string>} Hash bcrypt
 */
export async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

/**
 * Compara una contraseña en texto plano contra un hash bcrypt.
 * @param {string} plainPassword - Contraseña en texto plano
 * @param {string} hashedPassword - Hash almacenado
 * @returns {Promise<boolean>} True si coinciden
 */
export async function comparePassword(plainPassword, hashedPassword) {
  if (!hashedPassword) return false;
  return bcrypt.compare(plainPassword, hashedPassword);
}

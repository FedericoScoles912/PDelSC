/**
 * password.js
 * Hash y verificación de contraseñas con bcrypt.
 */
import bcrypt from 'bcryptjs';

const ROUNDS = 10;

/** @returns {Promise<string>} hash bcrypt */
export const hashPassword = (plain) => bcrypt.hash(plain, ROUNDS);

/**
 * @param {string} plain
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
export const verifyPassword = (plain, hash) => (hash ? bcrypt.compare(plain, hash) : Promise.resolve(false));

export default { hashPassword, verifyPassword };

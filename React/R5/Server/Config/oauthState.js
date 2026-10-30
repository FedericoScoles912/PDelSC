import crypto from 'node:crypto';

/**
 * Almacén en memoria del parámetro `state` de OAuth (protección CSRF).
 *
 * El parámetro state viaja al proveedor y vuelve en el callback. Lo generamos
 * acá, lo guardamos junto al contexto del flujo (login o vinculación, sistema
 * de frontend de destino, code_verifier de PKCE) y lo consumimos una sola vez
 * al volver. Un state desconocido o vencido invalida el callback.
 */
const TTL_MS = 10 * 60 * 1000;
const store = new Map();

/**
 * @param {object} meta Contexto del flujo:
 *   { provider, mode: 'login'|'link', userId?, system: 'router'|'state',
 *     codeVerifier? }
 * @returns {string} valor de state
 */
export function issueState(meta) {
  const state = crypto.randomBytes(24).toString('hex');
  store.set(state, { ...meta, expiresAt: Date.now() + TTL_MS });
  return state;
}

/**
 * Lee un state SIN consumirlo. Se usa al iniciar el flujo de vinculación,
 * donde necesitamos validar el state ya emitido y el consumo real ocurre
 * recién en el callback.
 */
export function peekState(state) {
  if (!state) return null;
  const record = store.get(state);
  if (!record) return null;
  if (Date.now() > record.expiresAt) return null;
  return record;
}

/** Consume un state (un solo uso). Devuelve null si no existe o expiró. */
export function consumeState(state) {
  if (!state) return null;

  const record = store.get(state);
  if (!record) return null;

  store.delete(state);

  if (Date.now() > record.expiresAt) return null;
  return record;
}

/** Genera un par code_verifier / code_challenge para PKCE (S256). */
export function createPkcePair() {
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');

  return { codeVerifier, codeChallenge };
}

const cleanup = setInterval(() => {
  const now = Date.now();
  for (const [state, record] of store.entries()) {
    if (now > record.expiresAt) store.delete(state);
  }
}, 60 * 1000);
cleanup.unref();

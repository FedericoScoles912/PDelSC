import crypto from 'node:crypto';

/**
 * Almacén en memoria de códigos temporales de un solo uso.
 *
 * El backend NUNCA pone el JWT en la URL de redirección: emite un código
 * opaco de vida corta (60 s) que el frontend canjea con POST /api/auth/exchange.
 * Un código se consume una sola vez (se borra al leerlo).
 *
 * Nota: al ser en memoria, un despliegue multi-instancia necesitaría un
 * almacén compartido (Redis). Para este demo alcanza.
 */
const TTL_MS = 60 * 1000;
const store = new Map();

function generateCode() {
  return crypto.randomBytes(32).toString('hex');
}

/** Emite un código nuevo asociado a un payload arbitrario. */
export function issueTempCode(payload) {
  const code = generateCode();
  store.set(code, { payload, expiresAt: Date.now() + TTL_MS });
  return code;
}

/**
 * Lee un código SIN consumirlo. Necesario para el caso "el proveedor no
 * devolvió email": el frontend primero consulta si hace falta completarlo
 * y solo se consume el código cuando el registro se finaliza.
 * Devuelve { payload } o null si no existe o expiró.
 */
export function peekTempCode(code) {
  const record = store.get(code);
  if (!record) return null;
  if (Date.now() > record.expiresAt) return null;
  return { payload: record.payload };
}

/**
 * Consume un código: lo borra (un solo uso) y devuelve su payload.
 * Devuelve null si no existe o si expiró.
 */
export function consumeTempCode(code) {
  const record = store.get(code);
  if (!record) return null;

  store.delete(code);

  if (Date.now() > record.expiresAt) return null;
  return record.payload;
}

// Limpieza periódica para no acumular códigos vencidos que nadie canjeó.
const cleanup = setInterval(() => {
  const now = Date.now();
  for (const [code, record] of store.entries()) {
    if (now > record.expiresAt) store.delete(code);
  }
}, 60 * 1000);
cleanup.unref();

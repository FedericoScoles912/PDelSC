/**
 * response.js
 * Formato uniforme de respuesta JSON.
 */
export const ok = (res, data, status = 200) => res.status(status).json({ ok: true, data });
export const created = (res, data) => ok(res, data, 201);
export const noContent = (res) => res.status(204).send();

export default { ok, created, noContent };

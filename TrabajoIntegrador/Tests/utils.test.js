/**
 * utils.test.js
 * Pruebas unitarias de las utilidades puras del backend (node:test, sin dependencias).
 * Ejecutar: npm test
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import { getPagination, buildMeta } from '../BACKEND/utils/pagination.js';
import ApiError from '../BACKEND/utils/ApiError.js';
import { toCsv } from '../BACKEND/utils/csv.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
} from '../BACKEND/utils/jwt.js';

test('getPagination: aplica valores por defecto y límites', () => {
  assert.deepEqual(getPagination({}), { page: 1, limit: 20, offset: 0 });
  assert.deepEqual(getPagination({ page: '3', limit: '10' }), { page: 3, limit: 10, offset: 20 });
  // page inválida -> 1 ; limit por encima del máximo -> 100
  assert.deepEqual(getPagination({ page: '0', limit: '500' }), { page: 1, limit: 100, offset: 0 });
});

test('buildMeta: calcula totalPages y banderas de navegación', () => {
  assert.deepEqual(buildMeta(365, 1, 20), {
    total: 365,
    page: 1,
    limit: 20,
    totalPages: 19,
    hasNext: true,
    hasPrev: false,
  });
  assert.equal(buildMeta(0, 1, 20).totalPages, 1);
  assert.equal(buildMeta(40, 2, 20).hasNext, false);
  assert.equal(buildMeta(40, 2, 20).hasPrev, true);
});

test('ApiError: fábricas con código HTTP y detalles', () => {
  assert.equal(ApiError.badRequest().statusCode, 400);
  assert.equal(ApiError.unauthorized().statusCode, 401);
  assert.equal(ApiError.forbidden().statusCode, 403);
  assert.equal(ApiError.notFound().statusCode, 404);
  assert.equal(ApiError.conflict().statusCode, 409);
  assert.equal(ApiError.unprocessable('x', { campo: 'eje' }).details.campo, 'eje');
  assert.equal(ApiError.internal().statusCode, 500);
  assert.ok(ApiError.badRequest() instanceof Error);
});

test('toCsv: escapa separadores, comillas y agrega BOM', () => {
  const rows = [{ a: 'VW; GOL', b: 'dice "hola"' }, { a: null, b: 12 }];
  const columns = [
    { key: 'a', header: 'Aplicación' },
    { key: 'b', header: 'Detalle' },
  ];
  const csv = toCsv(rows, columns);
  assert.ok(csv.startsWith('\uFEFF'));
  assert.match(csv, /^\uFEFFAplicación;Detalle/);
  assert.match(csv, /"VW; GOL";"dice ""hola"""/);
  assert.ok(csv.endsWith(';12'));
});

test('jwt: firma y verifica access token', () => {
  const token = signAccessToken({ id: 1, email: 'a@b.com', rol: 'Administrador' });
  const payload = verifyAccessToken(token);
  assert.equal(payload.id, 1);
  assert.equal(payload.rol, 'Administrador');
});

test('jwt: el refresh token incluye jti y no verifica con el secreto de access', () => {
  const refresh = signRefreshToken({ id: 7 });
  const payload = verifyRefreshToken(refresh);
  assert.equal(payload.id, 7);
  assert.ok(payload.jti);
  assert.throws(() => verifyAccessToken(refresh));
});

test('hashToken: es determinista y no expone el token original', () => {
  const token = signRefreshToken({ id: 3 });
  assert.equal(hashToken(token), hashToken(token));
  assert.notEqual(hashToken(token), token);
  assert.equal(hashToken(token).length, 64);
});

#!/usr/bin/env node
/**
 * @file Ejecutor de los scripts SQL en orden, contra la base configurada en
 *       `.env`. Alternativa a ejecutar los scripts manualmente en MySQL
 *       Workbench (ver Docs/Guia_TiDB.md).
 *
 * Uso:
 *   npm run db:migrate                 -> ejecuta 01, 02, 03, 04, 05, 06
 *   npm run db:migrate -- --sin-fk     -> usa 02b_tables_sin_fk.sql
 *   npm run db:migrate -- --rollback   -> ejecuta 99_rollback.sql
 *
 * Es idempotente: los scripts usan IF NOT EXISTS / INSERT ... ON DUPLICATE KEY.
 * @module Scripts/ejecutar_sql
 */

import fs from 'node:fs';
import path from 'node:path';

import mysql from 'mysql2/promise';

import { env, resolverRuta, validarEntorno } from '../Server/config/env.js';

/** Orden de ejecución por defecto. */
const ORDEN = ['01_schema.sql', '02_tables.sql', '03_indexes.sql', '04_seed_roles_admin.sql', '05_views.sql', '06_seed_productos.sql'];

/** Orden alternativo sin claves foráneas. */
const ORDEN_SIN_FK = ['01_schema.sql', '02b_tables_sin_fk.sql', '03_indexes.sql', '04_seed_roles_admin.sql', '05_views.sql', '06_seed_productos.sql'];

/**
 * Crea la conexión con soporte de sentencias múltiples.
 * @returns {Promise<import('mysql2/promise').Connection>}
 */
async function conectar() {
  const ssl = env.db.ssl ? { minVersion: 'TLSv1.2', rejectUnauthorized: true } : undefined;
  if (ssl && env.db.sslCa && env.db.sslCaExiste) {
    ssl.ca = fs.readFileSync(env.db.sslCa);
  }

  return mysql.createConnection({
    host: env.db.host,
    port: env.db.puerto,
    user: env.db.usuario,
    password: env.db.password,
    database: env.db.nombre,
    ssl,
    multipleStatements: true,
    connectTimeout: 15000,
    charset: 'utf8mb4_general_ci'
  });
}

/**
 * Ejecuta un archivo SQL completo.
 * @param {import('mysql2/promise').Connection} conexion
 * @param {string} archivo
 * @returns {Promise<number>} Cantidad de filas devueltas por el último SELECT (informativo).
 */
async function ejecutarArchivo(conexion, archivo) {
  const ruta = resolverRuta(path.join('SQL', archivo));
  if (!fs.existsSync(ruta)) {
    throw new Error(`No se encontró el archivo SQL: ${ruta}`);
  }

  const contenido = fs.readFileSync(ruta, 'utf8');
  const inicio = Date.now();
  const [resultado] = await conexion.query(contenido);
  const ms = Date.now() - inicio;

  const filas = Array.isArray(resultado) && Array.isArray(resultado[resultado.length - 1])
    ? resultado[resultado.length - 1].length
    : 0;

  console.log(`  [OK] ${archivo.padEnd(28)} ${String(ms).padStart(5)} ms  (filas devueltas: ${filas})`);
  return filas;
}

/**
 * Punto de entrada.
 */
async function principal() {
  const args = process.argv.slice(2);
  const sinFk = args.includes('--sin-fk');
  const rollback = args.includes('--rollback');

  const problemas = validarEntorno();
  if (problemas.length) {
    console.error('[ERROR] Configuración incompleta:');
    problemas.forEach((p) => console.error(`   - ${p}`));
    process.exitCode = 1;
    return;
  }

  console.log(`\nConectando a ${env.db.host}:${env.db.puerto} (base "${env.db.nombre}")...`);
  const conexion = await conectar();
  console.log(`  [OK] Conectado.\n`);

  try {
    const archivos = rollback ? ['99_rollback.sql'] : sinFk ? ORDEN_SIN_FK : ORDEN;
    console.log(rollback ? 'Ejecutando ROLLBACK:' : 'Ejecutando migración:');
    for (const archivo of archivos) {
      await ejecutarArchivo(conexion, archivo);
    }
    console.log('\n[OK] Migración finalizada.\n');
  } finally {
    await conexion.end();
  }
}

principal().catch((error) => {
  console.error('\n[ERROR] Falló la migración:', error?.message ?? error);
  if (error?.code) console.error(`        Código: ${error.code}`);
  if (error?.sql) console.error(`        SQL: ${String(error.sql).slice(0, 200)}`);
  process.exitCode = 1;
});

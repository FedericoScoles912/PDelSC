#!/usr/bin/env node
/**
 * importarExcel.js
 * Script de importación de la lista de precios de Retenes EMIC a MySQL.
 *
 * Uso:
 *   node BACKEND/import/importarExcel.js                     -> importa a la base
 *   node BACKEND/import/importarExcel.js --dry-run           -> sólo analiza y loguea
 *   node BACKEND/import/importarExcel.js --file=./ruta.xlsx  -> usa otro archivo
 *   node BACKEND/import/importarExcel.js --truncate          -> vacía productos antes
 *
 * Escribe un log detallado en IMPORT_LOG_DIR (descartes y advertencias).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from '../config/env.js';
import { pool, withTransaction } from '../config/db.js';
import logger from '../config/logger.js';
import { parseExcel } from './excelParser.js';
import { upsertProducto } from './productoImportCore.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

// ------------------------------ CLI args ----------------------------------
const args = process.argv.slice(2);
const hasFlag = (f) => args.includes(f);
const getOpt = (name, def) => {
  const found = args.find((a) => a.startsWith(`--${name}=`));
  return found ? found.split('=').slice(1).join('=') : def;
};

const DRY_RUN = hasFlag('--dry-run');
const TRUNCATE = hasFlag('--truncate');
const FILE = path.resolve(ROOT, getOpt('file', env.import.excelPath));

// ------------------------------ Main --------------------------------------
async function main() {
  if (!fs.existsSync(FILE)) {
    logger.error(`No se encontró el archivo Excel: ${FILE}`);
    logger.info('Copiá el .xlsx a ./imports/ o pasá --file=ruta/al/archivo.xlsx');
    process.exit(1);
  }

  logger.info(`Leyendo Excel: ${FILE}`);
  const data = parseExcel(FILE);
  logger.info(
    `Parseo OK -> ${data.meta.productosValidos} productos, ${data.meta.descartados} descartados, ${data.meta.advertencias} advertencias`,
  );
  logger.info(`Categorías detectadas: ${data.categorias.join(' | ')}`);

  // Log a archivo
  const logDir = path.resolve(ROOT, env.import.logDir);
  fs.mkdirSync(logDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const logFile = path.join(logDir, `import_${stamp}.json`);
  fs.writeFileSync(logFile, JSON.stringify(data, null, 2), 'utf8');
  logger.info(`Log detallado escrito en: ${logFile}`);

  if (data.descartes.length) {
    logger.warn('Primeros descartes:');
    data.descartes.slice(0, 10).forEach((d) => logger.warn(`  fila ${d.fila}: ${d.motivo}`));
  }

  if (DRY_RUN) {
    logger.info('🟡 DRY RUN: no se escribió nada en la base de datos.');
    // Muestra un ejemplo del primer producto parseado para validación visual
    logger.info('Ejemplo de producto parseado:');
    logger.info(JSON.stringify(data.productos[0], null, 2));
    await pool.end().catch(() => {});
    return;
  }

  const resumen = { insertados: 0, actualizados: 0, errores: 0 };
  const categoriaCache = new Map();

  if (TRUNCATE) {
    logger.warn('--truncate: vaciando tablas de catálogo...');
    await withTransaction(async (conn) => {
      await conn.execute(`SET FOREIGN_KEY_CHECKS = 0`);
      await conn.execute(`TRUNCATE TABLE equivalencias`);
      await conn.execute(`TRUNCATE TABLE historial_precios`);
      await conn.execute(`TRUNCATE TABLE movimientos_stock`);
      await conn.execute(`TRUNCATE TABLE stock`);
      await conn.execute(`TRUNCATE TABLE productos`);
      await conn.execute(`SET FOREIGN_KEY_CHECKS = 1`);
    });
  }

  for (const p of data.productos) {
    try {
      const { accion } = await withTransaction((conn) => upsertProducto(conn, p, categoriaCache));
      resumen[accion === 'insertado' ? 'insertados' : 'actualizados'] += 1;
    } catch (err) {
      resumen.errores += 1;
      logger.error(`Error importando ${p.codigo} (fila ${p.fila}): ${err.message}`);
    }
  }

  logger.info(
    `✅ Importación finalizada -> insertados: ${resumen.insertados}, actualizados: ${resumen.actualizados}, errores: ${resumen.errores}`,
  );
  await pool.end();
}

main().catch(async (err) => {
  logger.error('Fallo la importación:', err.message);
  if (/Access denied|ECONNREFUSED|Unknown database/i.test(err.message)) {
    logger.warn('Revisá la conexión MySQL en el archivo .env (DB_HOST/DB_USER/DB_PASSWORD/DB_NAME).');
  }
  await pool.end().catch(() => {});
  process.exit(1);
});

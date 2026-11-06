#!/usr/bin/env node
/**
 * @file CLI de importación de la lista de precios EMIC.
 *
 * Uso:
 *   npm run import:excel                 -> genera SQL + importa a la base (UPSERT)
 *   npm run import:excel -- --preview    -> muestra el impacto sin escribir nada
 *   npm run import:excel -- --solo-sql   -> sólo regenera SQL/06_seed_productos.sql
 *   node Scripts/importar_excel.js --excel=./imports/otra_lista.xlsx
 *
 * Requiere el archivo `imports/*.xlsx` y la configuración de `.env`.
 * @module Scripts/importar_excel
 */

import fs from 'node:fs';
import path from 'node:path';

import mysql from 'mysql2/promise';

import { env, resolverRuta, validarEntorno } from '../Server/config/env.js';
import { cerrarPool, query, verificarConexion } from '../Server/config/db.js';
import { leerExcel } from './lib/lector_excel.js';
import { generarSeedProductos } from './lib/generador_sql.js';
import { aplicarImportacion, generarPreview } from './lib/importador.js';

/** Scripts base para inicializar el esquema si aún no existen las tablas. */
const SCRIPTS_BASE = [
  '01_schema.sql',
  '02_tables.sql',
  '03_indexes.sql',
  '04_seed_roles_admin.sql',
  '05_views.sql'
];

/**
 * Verifica que las tablas del esquema existan; si la base está vacía (por ejemplo
 * tras `npm run db:rollback`), ejecuta automáticamente los scripts 01 a 05.
 */
async function asegurarEsquema() {
  const tablas = await query("SHOW TABLES LIKE 'categorias'");
  if (Array.isArray(tablas) && tablas.length > 0) return;

  console.log('  Esquema no encontrado: inicializando tablas base (01 -> 05)...');
  const ssl = env.db.ssl ? { minVersion: 'TLSv1.2', rejectUnauthorized: true } : undefined;
  if (ssl && env.db.sslCa && env.db.sslCaExiste) {
    ssl.ca = fs.readFileSync(env.db.sslCa);
  }

  const conexion = await mysql.createConnection({
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

  try {
    for (const archivo of SCRIPTS_BASE) {
      const ruta = resolverRuta(path.join('SQL', archivo));
      const sql = fs.readFileSync(ruta, 'utf8');
      await conexion.query(sql);
      console.log(`    [OK] ${archivo}`);
    }
  } finally {
    await conexion.end();
  }
}

/**
 * Interpreta los argumentos de la línea de comandos.
 * @param {string[]} argv
 * @returns {{soloSql:boolean, preview:boolean, sinSql:boolean, ayuda:boolean, archivo:string|null}}
 */
function interpretarArgumentos(argv) {
  const opciones = { soloSql: false, preview: false, sinSql: false, ayuda: false, archivo: null };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--solo-sql') opciones.soloSql = true;
    else if (arg === '--preview') opciones.preview = true;
    else if (arg === '--sin-sql') opciones.sinSql = true;
    else if (arg === '--ayuda' || arg === '-h' || arg === '--help') opciones.ayuda = true;
    else if (arg.startsWith('--excel=')) opciones.archivo = arg.slice('--excel='.length);
    else if (arg === '--excel') opciones.archivo = argv[++i] ?? null;
  }

  return opciones;
}

/**
 * Imprime la ayuda del CLI.
 */
function mostrarAyuda() {
  console.log(`
Importador de lista de precios EMIC — Sistema de Control de Stock

  node Scripts/importar_excel.js [opciones]

Opciones:
  --excel=<ruta>   Ruta al archivo .xlsx (por defecto EXCEL_PATH del .env)
  --preview        Compara contra la base y muestra el impacto SIN escribir
  --solo-sql       Sólo genera SQL/06_seed_productos.sql (no toca la base)
  --sin-sql        No regenera el archivo SQL
  -h, --ayuda      Muestra esta ayuda
`);
}

/**
 * Guarda el log de la importación en imports/logs/.
 * @param {Object} datos
 * @returns {string} Ruta del archivo escrito.
 */
function escribirLog(datos) {
  const directorio = resolverRuta(env.importacion.logDir);
  fs.mkdirSync(directorio, { recursive: true });

  const marca = datos.meta.fechaProceso.replace(/[:.]/g, '-');
  const ruta = path.join(directorio, `import_${marca}.json`);
  fs.writeFileSync(ruta, JSON.stringify(datos, null, 2), 'utf8');
  return ruta;
}

/**
 * Escribe el archivo SQL de seed.
 * @param {Object} datos
 * @returns {string} Ruta del archivo.
 */
function escribirSql(datos) {
  const contenido = generarSeedProductos(datos, { archivoOrigen: datos.meta.archivo });
  const ruta = resolverRuta(path.join('SQL', '06_seed_productos.sql'));
  fs.mkdirSync(path.dirname(ruta), { recursive: true });
  fs.writeFileSync(ruta, contenido, 'utf8');
  return ruta;
}

/**
 * Imprime un resumen legible de la lectura.
 * @param {Object} datos
 */
function imprimirResumenLectura(datos) {
  const { meta, categorias, descartes, advertencias } = datos;
  console.log('\n=== Lectura del Excel ===');
  console.log(`  Archivo          : ${meta.archivo} (hoja "${meta.hoja}")`);
  console.log(`  Filas totales    : ${meta.totalFilas}`);
  console.log(`  Categorías       : ${categorias.length}`);
  console.log(`  Productos válidos: ${meta.productosValidos}`);
  console.log(`  Descartados      : ${meta.descartados}`);
  console.log(`  Advertencias     : ${meta.advertencias}`);

  categorias.forEach((categoria, indice) => console.log(`    ${indice + 1}. ${categoria}`));

  if (descartes.length) {
    console.log('  Descartados:');
    descartes.forEach((d) => console.log(`    - fila ${d.fila} (${d.codigo}): ${d.motivo}`));
  }
  if (advertencias.length) {
    console.log('  Advertencias:');
    advertencias.forEach((a) => console.log(`    - fila ${a.fila}: ${a.motivo}`));
  }
}

/**
 * Imprime el resultado del preview (impacto antes de confirmar).
 * @param {Object} preview
 */
function imprimirPreview(preview) {
  console.log('\n=== Vista previa del impacto (nada fue escrito todavía) ===');
  console.log(`  Productos: ${preview.productos.total}`);
  console.log(`    - Nuevos        : ${preview.productos.nuevos}`);
  console.log(`    - Actualizados  : ${preview.productos.actualizados}`);
  console.log(`    - Sin cambios   : ${preview.productos.sinCambios}`);
  console.log(`  Equivalencias   : ${preview.equivalencias}`);
  console.log(`  Categorías nuevas: ${preview.categorias.nuevas.length}`);

  if (preview.cambiosDePrecio.length) {
    console.log(`  Cambios de precio: ${preview.cambiosDePrecio.length} (primeros 10)`);
    preview.cambiosDePrecio.slice(0, 10).forEach((cambio) => {
      console.log(`    - ${cambio.codigo}: ${formatearPrecio(cambio.anterior)} -> ${formatearPrecio(cambio.nuevo)}`);
    });
  }
}

/**
 * Formatea un precio para consola.
 * @param {number|null} valor
 * @returns {string}
 */
function formatearPrecio(valor) {
  if (valor === null || valor === undefined) return '(sin precio)';
  return `$${Number(valor).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
}

/**
 * Punto de entrada del CLI.
 */
async function principal() {
  const opciones = interpretarArgumentos(process.argv.slice(2));
  if (opciones.ayuda) {
    mostrarAyuda();
    return;
  }

  const archivoExcel = resolverRuta(opciones.archivo ?? env.importacion.excelPath);
  if (!fs.existsSync(archivoExcel)) {
    console.error(`\n[ERROR] No se encontró el archivo Excel: ${archivoExcel}`);
    console.error('        Verificá EXCEL_PATH en el .env o usá --excel=<ruta>.');
    process.exitCode = 1;
    return;
  }

  console.log(`\nImportando: ${path.basename(archivoExcel)}`);
  const datos = await leerExcel(archivoExcel);
  imprimirResumenLectura(datos);

  const rutaLog = escribirLog(datos);
  console.log(`\n  Log guardado en: ${path.relative(env.raizProyecto, rutaLog)}`);

  if (!opciones.sinSql) {
    const rutaSql = escribirSql(datos);
    console.log(`  SQL generado   : ${path.relative(env.raizProyecto, rutaSql)}`);
  }

  if (opciones.soloSql) {
    console.log('\n[OK] Sólo se generó el SQL (--solo-sql). No se tocó la base de datos.\n');
    return;
  }

  const problemas = validarEntorno();
  if (problemas.length) {
    console.error('\n[ERROR] Configuración incompleta para conectar a la base:');
    problemas.forEach((problema) => console.error(`   - ${problema}`));
    process.exitCode = 1;
    return;
  }

  const estado = await verificarConexion(2);
  if (!estado.ok) {
    console.error(`\n[ERROR] No se pudo conectar a la base de datos: ${estado.error}`);
    console.error('        Revisá DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_SSL en el .env.');
    console.error('        El SQL quedó generado igualmente: podés cargarlo desde Workbench.\n');
    process.exitCode = 1;
    return;
  }
  console.log(`\n  Conectado a la base (${estado.version}).`);
  await asegurarEsquema();

  const preview = await generarPreview(datos);
  imprimirPreview(preview);

  if (opciones.preview) {
    console.log('\n[OK] Modo --preview: no se escribió nada en la base.\n');
    return;
  }

  console.log('\nAplicando importación (UPSERT por código)...');
  const resumen = await aplicarImportacion(datos, { usuarioId: null });
  console.log('\n=== Importación finalizada ===');
  console.log(`  Categorías procesadas  : ${resumen.categorias}`);
  console.log(`  Productos nuevos       : ${resumen.productosInsertados}`);
  console.log(`  Productos actualizados : ${resumen.productosActualizados}`);
  console.log(`  Productos sin cambios  : ${resumen.productosSinCambios}`);
  console.log(`  Equivalencias cargadas : ${resumen.equivalencias}`);
  console.log(`  Precios con historial  : ${resumen.preciosActualizados}`);
  console.log('\n[OK] Importación completada con éxito.\n');
}

principal()
  .catch((error) => {
    console.error('\n[ERROR] Falló la importación:', error?.message ?? error);
    if (error?.code) console.error(`        Código: ${error.code}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    // Cierra el pool sólo si se llegó a usar (evita dejar el proceso colgado).
    try {
      await cerrarPool();
    } catch {
      // silencioso
    }
  });

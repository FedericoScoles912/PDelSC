/**
 * @file Servicio de Servidores Únicos por Negocio con autenticación mediante
 *       Código Único de Servidor (ID) y Contraseña del Servidor.
 *       Los servidores permanecen ocultos y no se listan públicamente: para
 *       conectarse a un negocio es obligatorio conocer su ID único y su contraseña.
 * @module Server/servicios/servidores.servicio
 */

import bcrypt from 'bcryptjs';

import { asegurarEntornoNegocio, getPool, normalizarIdNegocio } from '../config/db.js';
import { ApiError } from '../utils/http.js';

let tablaServidoresLista = false;

/**
 * Normaliza el código único del servidor (ID), por ejemplo: "srv-negocio-01" -> "SRV-NEGOCIO-01".
 * @param {string} codigo
 * @returns {string}
 */
export function normalizarCodigoServidor(codigo) {
  return String(codigo || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '-')
    .replace(/[^A-Z0-9_-]/g, '');
}

/**
 * Crea la tabla `servidores_negocio` en la base principal y siembra los servidores
 * iniciales protegidos con contraseña (ocultos al público).
 *
 * Credenciales iniciales por defecto:
 *  - Negocio 1 -> Código (ID): SRV-NEGOCIO-01 | Contraseña: negocio123
 *  - Negocio 2 -> Código (ID): SRV-NEGOCIO-02 | Contraseña: negocio234
 */
export async function asegurarTablaServidores() {
  if (tablaServidoresLista) return;
  const pool = getPool();

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS \`servidores_negocio\` (
      \`id\` BIGINT NOT NULL AUTO_INCREMENT,
      \`negocio_id\` VARCHAR(32) NOT NULL,
      \`codigo_servidor\` VARCHAR(48) NOT NULL,
      \`nombre\` VARCHAR(100) NOT NULL,
      \`descripcion\` VARCHAR(255) DEFAULT NULL,
      \`url_servidor\` VARCHAR(255) DEFAULT NULL,
      \`password_hash\` VARCHAR(255) NOT NULL,
      \`activo\` TINYINT(1) NOT NULL DEFAULT 1,
      \`creado_en\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`uk_srv_negocio_id\` (\`negocio_id\`),
      UNIQUE KEY \`uk_srv_codigo\` (\`codigo_servidor\`)
    )
  `);

  const [existentes] = await pool.execute('SELECT COUNT(*) AS total FROM `servidores_negocio`');
  if (Number(existentes?.[0]?.total ?? 0) === 0) {
    const hash1 = await bcrypt.hash('negocio123', 10);
    const hash2 = await bcrypt.hash('negocio234', 10);

    await pool.execute(
      `INSERT IGNORE INTO \`servidores_negocio\`
         (\`negocio_id\`, \`codigo_servidor\`, \`nombre\`, \`descripcion\`, \`url_servidor\`, \`password_hash\`, \`activo\`)
       VALUES
         ('negocio_1', 'SRV-NEGOCIO-01', 'Negocio 1', 'Servidor dedicado de gestión para Negocio 1', '', ?, 1),
         ('negocio_2', 'SRV-NEGOCIO-02', 'Negocio 2', 'Servidor dedicado de gestión para Negocio 2', '', ?, 1)`,
      [hash1, hash2]
    );
  }

  tablaServidoresLista = true;
}

/**
 * Valida el acceso a un servidor de negocio mediante su Código Único (ID) y su Contraseña.
 * Nunca revela la lista de servidores existentes.
 * @param {{codigoServidor:string, password:string}} datos
 * @returns {Promise<{id:string, codigoServidor:string, nombre:string, descripcion:string, urlServidor:string}>}
 */
export async function autenticarServidorNegocio({ codigoServidor, password }) {
  await asegurarTablaServidores();
  const pool = getPool();

  const codigoLimpio = normalizarCodigoServidor(codigoServidor);
  const clave = String(password || '');

  if (!codigoLimpio || !clave) {
    throw ApiError.noAutorizado('Ingresá el Código Único (ID) y la contraseña del servidor.');
  }

  const [filas] = await pool.execute(
    `SELECT \`id\`, \`negocio_id\`, \`codigo_servidor\`, \`nombre\`, \`descripcion\`,
            \`url_servidor\`, \`password_hash\`, \`activo\`
       FROM \`servidores_negocio\`
      WHERE UPPER(\`codigo_servidor\`) = ? OR UPPER(\`negocio_id\`) = ?
      LIMIT 1`,
    [codigoLimpio, codigoLimpio]
  );

  const servidor = filas?.[0];
  if (!servidor || !servidor.activo) {
    throw ApiError.noAutorizado(
      'Código de servidor o contraseña inválidos. Verificá los datos de acceso de tu negocio.'
    );
  }

  const coincide = await bcrypt.compare(clave, servidor.password_hash);
  if (!coincide) {
    throw ApiError.noAutorizado(
      'Código de servidor o contraseña inválidos. Verificá los datos de acceso de tu negocio.'
    );
  }

  await asegurarEntornoNegocio(servidor.negocio_id);

  return {
    id: servidor.negocio_id,
    codigoServidor: servidor.codigo_servidor,
    nombre: servidor.nombre,
    descripcion: servidor.descripcion || `Servidor dedicado exclusivo para ${servidor.nombre}`,
    urlServidor: servidor.url_servidor || ''
  };
}

/**
 * Registra un nuevo servidor único de negocio protegido por Código Único (ID) y Contraseña.
 * @param {{nombre:string, codigoServidor:string, password:string, urlServidor?:string, descripcion?:string}} datos
 * @returns {Promise<{id:string, codigoServidor:string, nombre:string, descripcion:string, urlServidor:string}>}
 */
export async function registrarServidorNegocio({
  nombre,
  codigoServidor,
  password,
  urlServidor = '',
  descripcion = ''
}) {
  await asegurarTablaServidores();
  const pool = getPool();

  const nombreLimpio = String(nombre || '').trim();
  const codigoLimpio = normalizarCodigoServidor(codigoServidor);
  const clave = String(password || '');

  if (!nombreLimpio) {
    throw ApiError.solicitudInvalida('El nombre del negocio es obligatorio.');
  }
  if (!codigoLimpio || codigoLimpio.length < 3) {
    throw ApiError.solicitudInvalida(
      'El Código Único del Servidor (ID) debe tener al menos 3 caracteres (ej: SRV-NEGOCIO-03).'
    );
  }
  if (clave.length < 4) {
    throw ApiError.solicitudInvalida(
      'La contraseña del servidor debe tener al menos 4 caracteres.'
    );
  }

  const negocioId = normalizarIdNegocio(
    codigoLimpio
      .toLowerCase()
      .replace(/^srv[-_]?/, '')
      .replace(/[^a-z0-9_]/g, '_')
  );

  const [duplicado] = await pool.execute(
    'SELECT `id` FROM `servidores_negocio` WHERE UPPER(`codigo_servidor`) = ? OR `negocio_id` = ? LIMIT 1',
    [codigoLimpio, negocioId]
  );

  if (duplicado?.length > 0) {
    throw ApiError.conflicto(
      'Ya existe un servidor registrado con ese Código Único (ID). Usá la opción "Ingresar a Servidor" con su contraseña.'
    );
  }

  const hash = await bcrypt.hash(clave, 10);
  const descFinal =
    String(descripcion || '').trim() || `Servidor dedicado exclusivo para ${nombreLimpio}`;
  const urlFinal = String(urlServidor || '').trim();

  await pool.execute(
    `INSERT INTO \`servidores_negocio\`
       (\`negocio_id\`, \`codigo_servidor\`, \`nombre\`, \`descripcion\`, \`url_servidor\`, \`password_hash\`, \`activo\`)
     VALUES (?, ?, ?, ?, ?, ?, 1)`,
    [negocioId, codigoLimpio, nombreLimpio, descFinal, urlFinal, hash]
  );

  await asegurarEntornoNegocio(negocioId);

  return {
    id: negocioId,
    codigoServidor: codigoLimpio,
    nombre: nombreLimpio,
    descripcion: descFinal,
    urlServidor: urlFinal
  };
}

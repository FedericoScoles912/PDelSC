/**
 * @file Servicio de productos: listado, búsqueda por medidas, CRUD y equivalencias.
 * @module Server/servicios/productos
 */

import { ejecutar, query, queryUna } from '../config/db.js';
import { ApiError } from '../utils/http.js';
import { clausulaLimite, columnaOrdenSegura, leerPaginacion, metaPaginacion } from '../utils/paginacion.js';

/** Fragmento de columnas del producto con el nombre de la categoría. */
const CAMPOS_PRODUCTO = `
  p.\`id\`, p.\`codigo\`, p.\`categoria_id\`, c.\`nombre\` AS categoria_nombre,
  p.\`lanzamiento\`, p.\`eje_texto\`, p.\`eje_valor\`, p.\`aloj_texto\`, p.\`aloj_valor\`,
  p.\`alt_texto\`, p.\`alt_valor\`, p.\`giro\`, p.\`uxb\`, p.\`observaciones\`,
  p.\`precio_lista\`, p.\`proximo_ingreso\`, p.\`proximo_embarque\`,
  p.\`stock\`, p.\`stock_minimo\`, p.\`activo\`, p.\`creado_en\`, p.\`actualizado_en\``;

/** Mapa de columnas de orden permitidas (clave lógica → expresión SQL). */
const ORDENABLES = Object.freeze({
  codigo: 'p.`codigo`',
  categoria: 'c.`nombre`',
  eje_valor: 'p.`eje_valor`',
  aloj_valor: 'p.`aloj_valor`',
  alt_valor: 'p.`alt_valor`',
  stock: 'p.`stock`',
  precio_lista: 'p.`precio_lista`',
  creado_en: 'p.`creado_en`',
  actualizado_en: 'p.`actualizado_en`'
});

/**
 * Normaliza una fila de base de datos a un objeto en camelCase.
 * @param {Object|null} fila
 * @returns {Object|null}
 */
export function mapaProducto(fila) {
  if (!fila) return null;

  return {
    id: fila.id,
    codigo: fila.codigo,
    categoriaId: fila.categoria_id,
    categoriaNombre: fila.categoria_nombre ?? null,
    lanzamiento: fila.lanzamiento,
    ejeTexto: fila.eje_texto,
    ejeValor: fila.eje_valor,
    alojTexto: fila.aloj_texto,
    alojValor: fila.aloj_valor,
    altTexto: fila.alt_texto,
    altValor: fila.alt_valor,
    giro: fila.giro,
    uxb: fila.uxb,
    observaciones: fila.observaciones,
    precioLista: fila.precio_lista,
    proximoIngreso: fila.proximo_ingreso,
    proximoEmbarque: fila.proximo_embarque,
    stock: fila.stock,
    stockMinimo: fila.stock_minimo,
    activo: fila.activo,
    creadoEn: fila.creado_en,
    actualizadoEn: fila.actualizado_en
  };
}

/**
 * Devuelve `null` si el valor es `undefined` o cadena vacía.
 * @param {*} valor
 * @returns {*}
 */
function valorONulo(valor) {
  return valor === undefined || valor === '' ? null : valor;
}

/**
 * Resuelve el `categoria_id` a partir de `categoria` (nombre) o `categoria_id`.
 * @param {Object} datos
 * @returns {Promise<number|null>}
 */
async function resolverCategoria(datos = {}) {
  if (datos.categoria_id !== undefined && datos.categoria_id !== null) {
    return datos.categoria_id;
  }
  if (datos.categoria) {
    const fila = await queryUna('SELECT `id` FROM `categorias` WHERE `nombre` = ?', [datos.categoria]);
    if (!fila) throw ApiError.solicitudInvalida('La categoría indicada no existe.');
    return fila.id;
  }
  return null;
}

/**
 * Lista productos con filtros y paginación.
 * @param {Object} [filtros]
 * @returns {Promise<{datos:Array<Object>, meta:Object}>}
 */
export async function listar(filtros = {}) {
  const { pagina, limite, offset } = leerPaginacion(filtros, { limiteDef: 20, limiteMax: 100 });

  const condiciones = [];
  const parametros = [];

  if (filtros.q) {
    const patron = `%${filtros.q}%`;
    condiciones.push(
      '(p.`codigo` LIKE ? OR p.`observaciones` LIKE ? OR p.`eje_texto` LIKE ? OR p.`aloj_texto` LIKE ? OR p.`alt_texto` LIKE ?)'
    );
    parametros.push(patron, patron, patron, patron, patron);
  }
  if (filtros.categoria_id) {
    condiciones.push('p.`categoria_id` = ?');
    parametros.push(filtros.categoria_id);
  }
  if (filtros.giro) {
    condiciones.push('p.`giro` = ?');
    parametros.push(filtros.giro);
  }
  if (filtros.activo !== undefined) {
    condiciones.push('p.`activo` = ?');
    parametros.push(filtros.activo ? 1 : 0);
  }
  if (filtros.lanzamiento !== undefined) {
    condiciones.push('p.`lanzamiento` = ?');
    parametros.push(filtros.lanzamiento ? 1 : 0);
  }
  if (filtros.proximo_ingreso !== undefined) {
    condiciones.push('p.`proximo_ingreso` = ?');
    parametros.push(filtros.proximo_ingreso ? 1 : 0);
  }
  if (filtros.stock_bajo) condiciones.push('p.`stock` <= p.`stock_minimo`');
  if (filtros.sin_stock) condiciones.push('p.`stock` = 0');

  const donde = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';

  const columna = columnaOrdenSegura(filtros.orden, Object.keys(ORDENABLES), 'creado_en');
  const columnaSql = ORDENABLES[columna];
  const dir = String(filtros.dir ?? 'desc').toLowerCase() === 'asc' ? 'ASC' : 'DESC';

  const totalFila = await queryUna(
    `SELECT COUNT(*) AS total
       FROM \`productos\` p
       LEFT JOIN \`categorias\` c ON c.\`id\` = p.\`categoria_id\`
       ${donde}`,
    parametros
  );

  const filas = await query(
    `SELECT ${CAMPOS_PRODUCTO}
       FROM \`productos\` p
       LEFT JOIN \`categorias\` c ON c.\`id\` = p.\`categoria_id\`
       ${donde}
       ORDER BY ${columnaSql} ${dir}, p.\`id\` DESC
       ${clausulaLimite(limite, offset)}`,
    parametros
  );

  return {
    datos: filas.map(mapaProducto),
    meta: metaPaginacion(totalFila?.total ?? 0, pagina, limite)
  };
}

/**
 * Obtiene un producto por id, con sus equivalencias.
 * @param {number} id
 * @returns {Promise<Object>}
 */
export async function obtener(id) {
  const fila = await queryUna(
    `SELECT ${CAMPOS_PRODUCTO}
       FROM \`productos\` p
       LEFT JOIN \`categorias\` c ON c.\`id\` = p.\`categoria_id\`
      WHERE p.\`id\` = ?`,
    [id]
  );

  if (!fila) throw ApiError.noEncontrado('Producto no encontrado.');

  const producto = mapaProducto(fila);
  producto.equivalencias = await listarEquivalencias(id);
  return producto;
}

/**
 * Busca productos por medidas con tolerancia (eje/aloj/alt ± tolerancia).
 * @param {Object} [filtros]
 * @returns {Promise<Array<Object>>}
 */
export async function buscarPorMedidas(filtros = {}) {
  const tol = Number(filtros.tolerancia);
  const tolerancia = Number.isFinite(tol) && tol >= 0 ? tol : 0.5;

  const condiciones = [];
  const parametros = [];

  const medidas = [
    ['p.`eje_valor`', filtros.eje],
    ['p.`aloj_valor`', filtros.aloj],
    ['p.`alt_valor`', filtros.alt]
  ];

  for (const [columna, valor] of medidas) {
    if (valor === undefined || valor === null || String(valor).trim() === '') continue;
    const numero = Number(valor);
    if (!Number.isFinite(numero)) continue;
    condiciones.push(`${columna} BETWEEN ? AND ?`);
    parametros.push(numero - tolerancia, numero + tolerancia);
  }

  if (filtros.giro) {
    condiciones.push('p.`giro` = ?');
    parametros.push(filtros.giro);
  }
  if (filtros.categoria_id) {
    condiciones.push('p.`categoria_id` = ?');
    parametros.push(filtros.categoria_id);
  }
  if (filtros.activo !== undefined) {
    condiciones.push('p.`activo` = ?');
    parametros.push(filtros.activo ? 1 : 0);
  }

  const donde = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';

  const filas = await query(
    `SELECT ${CAMPOS_PRODUCTO}
       FROM \`productos\` p
       LEFT JOIN \`categorias\` c ON c.\`id\` = p.\`categoria_id\`
       ${donde}
       ORDER BY p.\`eje_valor\` ASC, p.\`aloj_valor\` ASC, p.\`alt_valor\` ASC, p.\`codigo\` ASC
       LIMIT 100`,
    parametros
  );

  return filas.map(mapaProducto);
}

/**
 * Búsqueda general por código, observaciones, medidas o equivalencias.
 * @param {string} texto
 * @returns {Promise<Array<Object>>}
 */
export async function buscar(texto) {
  const patron = `%${texto}%`;

  const filas = await query(
    `SELECT ${CAMPOS_PRODUCTO}
       FROM \`productos\` p
       LEFT JOIN \`categorias\` c ON c.\`id\` = p.\`categoria_id\`
      WHERE p.\`codigo\` LIKE ?
         OR p.\`observaciones\` LIKE ?
         OR p.\`eje_texto\` LIKE ?
         OR p.\`aloj_texto\` LIKE ?
         OR p.\`alt_texto\` LIKE ?
         OR EXISTS (
              SELECT 1 FROM \`equivalencias\` e
               WHERE e.\`producto_id\` = p.\`id\` AND e.\`codigo\` LIKE ?
            )
      ORDER BY p.\`codigo\` ASC
      LIMIT 50`,
    [patron, patron, patron, patron, patron, patron]
  );

  return filas.map(mapaProducto);
}

/**
 * Crea un producto resolviendo su categoría.
 * @param {Object} datos
 * @returns {Promise<Object>}
 */
export async function crear(datos = {}) {
  const categoriaId = await resolverCategoria(datos);

  try {
    const resultado = await ejecutar(
      `INSERT INTO \`productos\`
        (\`codigo\`, \`categoria_id\`, \`lanzamiento\`, \`eje_texto\`, \`eje_valor\`,
         \`aloj_texto\`, \`aloj_valor\`, \`alt_texto\`, \`alt_valor\`, \`giro\`, \`uxb\`,
         \`observaciones\`, \`precio_lista\`, \`proximo_ingreso\`, \`proximo_embarque\`,
         \`stock\`, \`stock_minimo\`)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        datos.codigo,
        categoriaId,
        datos.lanzamiento ? 1 : 0,
        valorONulo(datos.eje_texto),
        valorONulo(datos.eje_valor),
        valorONulo(datos.aloj_texto),
        valorONulo(datos.aloj_valor),
        valorONulo(datos.alt_texto),
        valorONulo(datos.alt_valor),
        valorONulo(datos.giro),
        valorONulo(datos.uxb),
        valorONulo(datos.observaciones),
        valorONulo(datos.precio_lista),
        datos.proximo_ingreso ? 1 : 0,
        datos.proximo_embarque ?? 0,
        datos.stock ?? 0,
        datos.stock_minimo ?? 0
      ]
    );

    return await obtener(resultado.insertId);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw ApiError.conflicto('Ya existe un producto con ese código.');
    }
    throw error;
  }
}

/**
 * Actualiza los campos provistos de un producto (no permite cambiar `codigo`).
 * @param {number} id
 * @param {Object} datos
 * @returns {Promise<Object>}
 */
export async function actualizar(id, datos = {}) {
  const actual = await queryUna('SELECT `id` FROM `productos` WHERE `id` = ?', [id]);
  if (!actual) throw ApiError.noEncontrado('Producto no encontrado.');

  let categoriaId;
  if (datos.categoria_id !== undefined || datos.categoria !== undefined) {
    categoriaId = await resolverCategoria(datos);
  }

  const asignaciones = [];
  const parametros = [];
  const normalizar = (valor) => (valor === '' ? null : valor);

  const booleanos = ['lanzamiento', 'proximo_ingreso'];
  const numericos = ['uxb', 'proximo_embarque', 'stock', 'stock_minimo'];
  const cadenas = ['eje_texto', 'aloj_texto', 'alt_texto', 'giro', 'observaciones'];
  const decimales = ['eje_valor', 'aloj_valor', 'alt_valor', 'precio_lista'];

  for (const campo of booleanos) {
    if (datos[campo] !== undefined) {
      asignaciones.push(`\`${campo}\` = ?`);
      parametros.push(datos[campo] ? 1 : 0);
    }
  }
  for (const campo of [...numericos, ...cadenas, ...decimales]) {
    if (datos[campo] !== undefined) {
      asignaciones.push(`\`${campo}\` = ?`);
      parametros.push(normalizar(datos[campo]));
    }
  }
  if (categoriaId !== undefined) {
    asignaciones.push('`categoria_id` = ?');
    parametros.push(categoriaId);
  }

  if (asignaciones.length) {
    parametros.push(id);
    await ejecutar(`UPDATE \`productos\` SET ${asignaciones.join(', ')} WHERE \`id\` = ?`, parametros);
  }

  return obtener(id);
}

/**
 * Activa o desactiva un producto.
 * @param {number} id
 * @param {boolean} activo
 * @returns {Promise<Object>}
 */
export async function cambiarActivo(id, activo) {
  const actual = await queryUna('SELECT `id` FROM `productos` WHERE `id` = ?', [id]);
  if (!actual) throw ApiError.noEncontrado('Producto no encontrado.');

  await ejecutar('UPDATE `productos` SET `activo` = ? WHERE `id` = ?', [activo ? 1 : 0, id]);
  return obtener(id);
}

/**
 * Elimina un producto y sus registros dependientes (equivalencias, movimientos e historial de precios).
 * @param {number} id
 * @returns {Promise<{id:number, codigo:string, eliminado:boolean, activo:number}>}
 */
export async function eliminar(id) {
  const actual = await queryUna('SELECT `id`, `codigo` FROM `productos` WHERE `id` = ?', [id]);
  if (!actual) throw ApiError.noEncontrado('Producto no encontrado.');

  await ejecutar('DELETE FROM `equivalencias` WHERE `producto_id` = ?', [id]);
  await ejecutar('DELETE FROM `movimientos_stock` WHERE `producto_id` = ?', [id]);
  await ejecutar('DELETE FROM `historial_precios` WHERE `producto_id` = ?', [id]);
  await ejecutar('DELETE FROM `productos` WHERE `id` = ?', [id]);
  return { id, codigo: actual.codigo, eliminado: true, activo: 0 };
}

/**
 * Lista las equivalencias de un producto.
 * @param {number} productoId
 * @returns {Promise<Array<Object>>}
 */
export async function listarEquivalencias(productoId) {
  return query(
    `SELECT \`id\`, \`producto_id\`, \`tipo\`, \`codigo\`, \`creado_en\`
       FROM \`equivalencias\`
      WHERE \`producto_id\` = ?
      ORDER BY \`tipo\` ASC, \`codigo\` ASC`,
    [productoId]
  );
}

/**
 * Agrega una equivalencia (OEM | A | S) evitando duplicados.
 * @param {number} productoId
 * @param {Object} datos
 * @param {'OEM'|'A'|'S'} datos.tipo
 * @param {string} datos.codigo
 * @returns {Promise<Array<Object>>}
 */
export async function agregarEquivalencia(productoId, { tipo, codigo } = {}) {
  if (!['OEM', 'A', 'S'].includes(tipo)) {
    throw ApiError.solicitudInvalida('El tipo de equivalencia debe ser OEM, A o S.');
  }

  const producto = await queryUna('SELECT `id` FROM `productos` WHERE `id` = ?', [productoId]);
  if (!producto) throw ApiError.noEncontrado('Producto no encontrado.');

  await ejecutar(
    'INSERT IGNORE INTO `equivalencias` (`producto_id`, `tipo`, `codigo`) VALUES (?, ?, ?)',
    [productoId, tipo, codigo]
  );

  return listarEquivalencias(productoId);
}

/**
 * Elimina una equivalencia de un producto.
 * @param {number} productoId
 * @param {number} equivId
 * @returns {Promise<{id:number}>}
 */
export async function eliminarEquivalencia(productoId, equivId) {
  const resultado = await ejecutar(
    'DELETE FROM `equivalencias` WHERE `id` = ? AND `producto_id` = ?',
    [equivId, productoId]
  );

  if (!resultado.affectedRows) throw ApiError.noEncontrado('Equivalencia no encontrada.');
  return { id: equivId };
}

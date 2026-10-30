/**
 * @file Servicio del dashboard: KPIs agregados del sistema.
 *       Se resuelve con varias consultas simples (sin window functions ni CTE
 *       recursivas) para asegurar compatibilidad con TiDB Cloud.
 * @module Server/servicios/dashboard.servicio
 */

import { query, queryUna } from '../config/db.js';

/**
 * Arma el resumen completo del dashboard.
 * @returns {Promise<Object>}
 */
export async function resumen() {
  const productosFila = await queryUna(
    `SELECT COUNT(*) AS total,
            COALESCE(SUM(CASE WHEN \`activo\` = 1 THEN 1 ELSE 0 END), 0) AS activos,
            COALESCE(SUM(CASE WHEN \`activo\` = 0 THEN 1 ELSE 0 END), 0) AS inactivos
       FROM \`productos\``
  );

  const stockFila = await queryUna(
    `SELECT
       (SELECT COUNT(*) FROM \`vw_productos_bajo_minimo\`) AS bajoMinimo,
       (SELECT COUNT(*) FROM \`vw_stock_actual\` WHERE \`stock\` = 0) AS sinStock,
       (SELECT COALESCE(SUM(\`stock\`), 0) FROM \`vw_stock_actual\`) AS unidadesTotales,
       (SELECT COALESCE(SUM(\`valor_stock\`), 0) FROM \`vw_stock_actual\`) AS valorTotal`
  );

  const categoriasFila = await queryUna('SELECT COUNT(*) AS total FROM `categorias`');

  const usuariosFila = await queryUna(
    `SELECT COUNT(*) AS total,
            COALESCE(SUM(CASE WHEN \`activo\` = 1 THEN 1 ELSE 0 END), 0) AS activos
       FROM \`usuarios\``
  );

  const movimientosFila = await queryUna(
    `SELECT
       COUNT(*) AS ultimos7Dias,
       COALESCE(SUM(CASE WHEN \`tipo\` = 'ingreso' THEN 1 ELSE 0 END), 0) AS ingresos7Dias,
       COALESCE(SUM(CASE WHEN \`tipo\` = 'egreso' THEN 1 ELSE 0 END), 0) AS egresos7Dias
     FROM \`movimientos_stock\`
     WHERE \`creado_en\` >= DATE_SUB(NOW(), INTERVAL 7 DAY)`
  );

  const porCategoria = await query(
    'SELECT * FROM `vw_resumen_categoria` ORDER BY `valor_stock` DESC'
  );

  const ultimosMovimientos = await query(
    `SELECT m.\`id\`, m.\`producto_id\`, p.\`codigo\` AS producto_codigo,
            m.\`tipo\`, m.\`cantidad\`, m.\`stock_anterior\`, m.\`stock_resultante\`,
            m.\`motivo\`, m.\`referencia\`, m.\`creado_en\`,
            CONCAT(u.\`nombre\`, ' ', COALESCE(u.\`apellido\`, '')) AS usuario_nombre
       FROM \`movimientos_stock\` m
       LEFT JOIN \`productos\` p ON p.\`id\` = m.\`producto_id\`
       LEFT JOIN \`usuarios\` u ON u.\`id\` = m.\`usuario_id\`
       ORDER BY m.\`creado_en\` DESC, m.\`id\` DESC
       LIMIT 10`
  );

  const alertasStock = await query(
    'SELECT * FROM `vw_productos_bajo_minimo` ORDER BY `faltante` DESC, `codigo` LIMIT 10'
  );

  const configuracion = await query(
    'SELECT `clave`, `valor` FROM `configuracion` ORDER BY `clave`'
  );

  return {
    productos: {
      total: Number(productosFila?.total ?? 0),
      activos: Number(productosFila?.activos ?? 0),
      inactivos: Number(productosFila?.inactivos ?? 0)
    },
    stock: {
      bajoMinimo: Number(stockFila?.bajoMinimo ?? 0),
      sinStock: Number(stockFila?.sinStock ?? 0),
      unidadesTotales: Number(stockFila?.unidadesTotales ?? 0),
      valorTotal: Number(stockFila?.valorTotal ?? 0)
    },
    categorias: {
      total: Number(categoriasFila?.total ?? 0)
    },
    usuarios: {
      total: Number(usuariosFila?.total ?? 0),
      activos: Number(usuariosFila?.activos ?? 0)
    },
    movimientos: {
      ultimos7Dias: Number(movimientosFila?.ultimos7Dias ?? 0),
      ingresos7Dias: Number(movimientosFila?.ingresos7Dias ?? 0),
      egresos7Dias: Number(movimientosFila?.egresos7Dias ?? 0)
    },
    porCategoria,
    ultimosMovimientos,
    alertasStock,
    configuracion
  };
}

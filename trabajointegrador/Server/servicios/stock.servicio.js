/**
 * @file Servicio de stock: consulta de movimientos, registro transaccional de
 *       ingresos/egresos/ajustes y alertas de reposición.
 * @module Server/servicios/stock.servicio
 */

import { query, queryUna, conTransaccion, conReintentos } from '../config/db.js';
import { clausulaLimite, leerPaginacion, metaPaginacion } from '../utils/paginacion.js';
import { ApiError } from '../utils/http.js';

/**
 * Lista movimientos de stock con filtros y paginación.
 * @param {Object} [filtros]
 * @param {number} [filtros.producto_id]
 * @param {'ingreso'|'egreso'|'ajuste'} [filtros.tipo]
 * @param {string} [filtros.desde]
 * @param {string} [filtros.hasta]
 * @param {number} [filtros.usuario_id]
 * @param {number} [filtros.pagina]
 * @param {number} [filtros.limite]
 * @returns {Promise<{datos:Array<Object>, meta:Object}>}
 */
export async function listarMovimientos(filtros = {}) {
  const { pagina, limite, offset } = leerPaginacion(filtros, { limiteDef: 30, limiteMax: 200 });

  const condiciones = [];
  const parametros = [];

  if (filtros.producto_id) {
    condiciones.push('m.`producto_id` = ?');
    parametros.push(filtros.producto_id);
  }
  if (filtros.tipo) {
    condiciones.push('m.`tipo` = ?');
    parametros.push(filtros.tipo);
  }
  if (filtros.desde) {
    condiciones.push('m.`creado_en` >= ?');
    parametros.push(filtros.desde);
  }
  if (filtros.hasta) {
    condiciones.push('m.`creado_en` <= ?');
    parametros.push(filtros.hasta);
  }
  if (filtros.usuario_id) {
    condiciones.push('m.`usuario_id` = ?');
    parametros.push(filtros.usuario_id);
  }

  const donde = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';

  const totalFila = await queryUna(
    `SELECT COUNT(*) AS total FROM \`movimientos_stock\` m ${donde}`,
    parametros
  );

  const datos = await query(
    `SELECT m.\`id\`, m.\`producto_id\`, p.\`codigo\` AS producto_codigo,
            m.\`tipo\`, m.\`cantidad\`, m.\`stock_anterior\`, m.\`stock_resultante\`,
            m.\`motivo\`, m.\`referencia\`, m.\`usuario_id\`, m.\`creado_en\`,
            CONCAT(u.\`nombre\`, ' ', COALESCE(u.\`apellido\`, '')) AS usuario_nombre
       FROM \`movimientos_stock\` m
       LEFT JOIN \`productos\` p ON p.\`id\` = m.\`producto_id\`
       LEFT JOIN \`usuarios\` u ON u.\`id\` = m.\`usuario_id\`
       ${donde}
       ORDER BY m.\`creado_en\` DESC, m.\`id\` DESC
       ${clausulaLimite(limite, offset)}`,
    parametros
  );

  return { datos, meta: metaPaginacion(totalFila?.total ?? 0, pagina, limite) };
}

/**
 * Registra un movimiento de stock dentro de una transacción con bloqueo de fila.
 * @param {Object} entrada
 * @param {number} entrada.producto_id
 * @param {'ingreso'|'egreso'|'ajuste'} entrada.tipo
 * @param {number} entrada.cantidad
 * @param {string|null} [entrada.motivo]
 * @param {string|null} [entrada.referencia]
 * @param {number|null} [usuarioId]
 * @returns {Promise<{movimiento:Object, stockAnterior:number, stockResultante:number}>}
 */
export async function registrarMovimiento(
  { producto_id, tipo, cantidad, motivo = null, referencia = null },
  usuarioId = null
) {
  if (!Number.isInteger(cantidad) || cantidad <= 0) {
    throw ApiError.solicitudInvalida('La cantidad debe ser un entero mayor a cero.');
  }

  return conReintentos(() =>
    conTransaccion(async (conexion) => {
      const [filas] = await conexion.execute(
        'SELECT `id`, `codigo`, `stock` FROM `productos` WHERE `id` = ? FOR UPDATE',
        [producto_id]
      );
      const producto = filas[0];
      if (!producto) throw ApiError.noEncontrado('Producto no encontrado.');

      const stockAnterior = Number(producto.stock);

      let stockResultante;
      let cantidadMovimiento = cantidad;

      if (tipo === 'ingreso') {
        stockResultante = stockAnterior + cantidad;
      } else if (tipo === 'egreso') {
        if (cantidad > stockAnterior) {
          throw ApiError.solicitudInvalida(
            `Stock insuficiente: disponible ${stockAnterior}, solicitado ${cantidad}.`
          );
        }
        stockResultante = stockAnterior - cantidad;
      } else {
        // ajuste: `cantidad` representa el stock resultante absoluto.
        stockResultante = cantidad;
        cantidadMovimiento = Math.abs(cantidad - stockAnterior);
      }

      const [resultado] = await conexion.execute(
        `INSERT INTO \`movimientos_stock\`
           (\`producto_id\`, \`tipo\`, \`cantidad\`, \`stock_anterior\`, \`stock_resultante\`, \`motivo\`, \`referencia\`, \`usuario_id\`)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [producto_id, tipo, cantidadMovimiento, stockAnterior, stockResultante, motivo, referencia, usuarioId]
      );

      await conexion.execute(
        'UPDATE `productos` SET `stock` = ? WHERE `id` = ?',
        [stockResultante, producto_id]
      );

      const movimiento = {
        id: resultado.insertId,
        producto_id,
        producto_codigo: producto.codigo,
        tipo,
        cantidad: cantidadMovimiento,
        stock_anterior: stockAnterior,
        stock_resultante: stockResultante,
        motivo,
        referencia,
        usuario_id: usuarioId
      };

      return { movimiento, stockAnterior, stockResultante };
    })
  );
}

/**
 * Devuelve los productos cuyo stock está en o por debajo del mínimo.
 * @returns {Promise<Array<Object>>}
 */
export async function alertas() {
  return query(
    'SELECT * FROM `vw_productos_bajo_minimo` ORDER BY `faltante` DESC, `codigo`'
  );
}

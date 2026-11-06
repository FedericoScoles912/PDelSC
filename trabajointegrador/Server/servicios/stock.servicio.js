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

/**
 * Consulta el stock físico real que se encuentra en depósito (stock > 0).
 * Exclusivo para Encargado de Depósito y Administrador.
 * @param {Object} [filtros]
 * @returns {Promise<{resumen:Object, datos:Array<Object>, meta:Object}>}
 */
export async function obtenerStockDeposito(filtros = {}) {
  const { pagina, limite, offset } = leerPaginacion(filtros, { limiteDef: 30, limiteMax: 100 });

  // 1) Métricas consolidadas del depósito físico
  const filaResumen = await queryUna(`
    SELECT
      COALESCE(SUM(p.\`stock\`), 0) AS total_unidades,
      COUNT(p.\`id\`) AS total_articulos,
      COALESCE(SUM(CASE WHEN p.\`stock\` <= p.\`stock_minimo\` THEN 1 ELSE 0 END), 0) AS articulos_criticos,
      COALESCE(SUM(p.\`proximo_embarque\`), 0) AS unidades_embarque,
      COALESCE(SUM(p.\`stock\` * COALESCE(p.\`precio_lista\`, 0)), 0) AS valor_estimado
    FROM \`productos\` p
    WHERE p.\`activo\` = 1 AND p.\`stock\` > 0
  `);

  const resumen = {
    totalUnidades: Number(filaResumen?.total_unidades ?? 0),
    totalArticulosConStock: Number(filaResumen?.total_articulos ?? 0),
    articulosCriticos: Number(filaResumen?.articulos_criticos ?? 0),
    unidadesEmbarque: Number(filaResumen?.unidades_embarque ?? 0),
    valorEstimado: Number(filaResumen?.valor_estimado ?? 0)
  };

  // 2) Filtros para la lista de productos del depósito
  const condiciones = ['p.`activo` = 1', 'p.`stock` > 0'];
  const parametros = [];

  if (filtros.q) {
    const patron = `%${filtros.q}%`;
    condiciones.push('(p.`codigo` LIKE ? OR p.`observaciones` LIKE ? OR p.`eje_texto` LIKE ? OR p.`aloj_texto` LIKE ?)');
    parametros.push(patron, patron, patron, patron);
  }

  if (filtros.categoria_id) {
    condiciones.push('p.`categoria_id` = ?');
    parametros.push(filtros.categoria_id);
  }

  if (filtros.estado === 'critico') {
    condiciones.push('p.`stock` <= p.`stock_minimo`');
  } else if (filtros.estado === 'embarque') {
    condiciones.push('p.`proximo_embarque` > 0');
  }

  const donde = `WHERE ${condiciones.join(' AND ')}`;

  const totalFila = await queryUna(
    `SELECT COUNT(*) AS total
       FROM \`productos\` p
       LEFT JOIN \`categorias\` c ON c.\`id\` = p.\`categoria_id\`
       ${donde}`,
    parametros
  );

  const filas = await query(
    `SELECT
       p.\`id\`, p.\`codigo\`, p.\`categoria_id\`, c.\`nombre\` AS categoria_nombre,
       p.\`stock\`, p.\`stock_minimo\`, p.\`proximo_embarque\`, p.\`proximo_ingreso\`,
       p.\`eje_texto\`, p.\`aloj_texto\`, p.\`alt_texto\`, p.\`giro\`, p.\`uxb\`,
       p.\`observaciones\`, p.\`precio_lista\`, p.\`actualizado_en\`
     FROM \`productos\` p
     LEFT JOIN \`categorias\` c ON c.\`id\` = p.\`categoria_id\`
     ${donde}
     ORDER BY p.\`stock\` DESC, p.\`codigo\` ASC
     ${clausulaLimite(limite, offset)}`,
    parametros
  );

  return {
    resumen,
    datos: filas.map((f) => ({
      id: f.id,
      codigo: f.codigo,
      categoriaId: f.categoria_id,
      categoriaNombre: f.categoria_nombre ?? 'Sin categoría',
      stock: Number(f.stock),
      stockMinimo: Number(f.stock_minimo),
      proximoEmbarque: Number(f.proximo_embarque),
      proximoIngreso: Boolean(f.proximo_ingreso),
      ejeTexto: f.eje_texto,
      alojTexto: f.aloj_texto,
      altTexto: f.alt_texto,
      giro: f.giro,
      uxb: f.uxb ? Number(f.uxb) : null,
      observaciones: f.observaciones,
      precioLista: f.precio_lista !== null ? Number(f.precio_lista) : null,
      actualizadoEn: f.actualizado_en
    })),
    meta: metaPaginacion(totalFila?.total ?? 0, pagina, limite)
  };
}

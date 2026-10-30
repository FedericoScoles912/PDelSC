/**
 * @file Servicio de precios: cambio puntual, historial y ajuste masivo.
 * @module Server/servicios/precios
 */

import { conReintentos, conTransaccion, query, queryUna } from '../config/db.js';
import { ApiError } from '../utils/http.js';
import { clausulaLimite, leerPaginacion, metaPaginacion } from '../utils/paginacion.js';
import { obtener } from './productos.servicio.js';

/**
 * Cambia el precio de lista de un producto y registra el historial.
 * @param {number} productoId
 * @param {Object} datos
 * @param {number} datos.precioLista
 * @param {string} [datos.motivo]
 * @param {number|null} [usuarioId]
 * @returns {Promise<{producto:Object, precioAnterior:(number|null), precioNuevo:number}>}
 */
export async function cambiarPrecio(productoId, { precioLista, motivo = null } = {}, usuarioId = null) {
  const resultado = await conReintentos(() =>
    conTransaccion(async (conexion) => {
      const [filas] = await conexion.execute(
        'SELECT `id`, `precio_lista` FROM `productos` WHERE `id` = ? FOR UPDATE',
        [productoId]
      );
      const fila = filas[0];
      if (!fila) throw ApiError.noEncontrado('Producto no encontrado.');

      const precioAnterior = fila.precio_lista === null ? null : Number(fila.precio_lista);
      const precioNuevo = Number(precioLista);

      if (precioAnterior !== null && precioAnterior === precioNuevo) {
        return { precioAnterior, precioNuevo };
      }

      await conexion.execute(
        'UPDATE `productos` SET `precio_lista` = ? WHERE `id` = ?',
        [precioNuevo, productoId]
      );
      await conexion.execute(
        `INSERT INTO \`historial_precios\`
           (\`producto_id\`, \`precio_anterior\`, \`precio_nuevo\`, \`origen\`, \`usuario_id\`)
         VALUES (?, ?, ?, ?, ?)`,
        [productoId, precioAnterior, precioNuevo, 'manual', usuarioId]
      );

      return { precioAnterior, precioNuevo };
    })
  );

  const producto = await obtener(productoId);
  return { producto, precioAnterior: resultado.precioAnterior, precioNuevo: resultado.precioNuevo };
}

/**
 * Devuelve el historial de precios de un producto, paginado.
 * @param {number} productoId
 * @param {Object} [filtros]
 * @returns {Promise<{datos:Array<Object>, meta:Object}>}
 */
export async function historial(productoId, filtros = {}) {
  const { pagina, limite, offset } = leerPaginacion(filtros, { limiteDef: 20, limiteMax: 100 });

  const totalFila = await queryUna(
    'SELECT COUNT(*) AS total FROM `historial_precios` WHERE `producto_id` = ?',
    [productoId]
  );

  const datos = await query(
    `SELECT h.\`id\`, h.\`producto_id\`, h.\`precio_anterior\`, h.\`precio_nuevo\`,
            h.\`origen\`, h.\`usuario_id\`, h.\`creado_en\`,
            CONCAT(u.\`nombre\`, ' ', COALESCE(u.\`apellido\`, '')) AS usuario_nombre,
            u.\`email\` AS usuario_email
       FROM \`historial_precios\` h
       LEFT JOIN \`usuarios\` u ON u.\`id\` = h.\`usuario_id\`
      WHERE h.\`producto_id\` = ?
      ORDER BY h.\`creado_en\` DESC, h.\`id\` DESC
      ${clausulaLimite(limite, offset)}`,
    [productoId]
  );

  return { datos, meta: metaPaginacion(totalFila?.total ?? 0, pagina, limite) };
}

/**
 * Ajusta masivamente los precios por porcentaje y registra el historial.
 * @param {Object} datos
 * @param {number|null} [datos.categoriaId]
 * @param {number} datos.porcentaje
 * @param {number} [datos.redondearA]
 * @param {number|null} [usuarioId]
 * @returns {Promise<{afectados:number, porcentaje:number, categoriaId:(number|null)}>}
 */
export async function ajusteMasivo({ categoriaId = null, porcentaje, redondearA = 2 } = {}, usuarioId = null) {
  const factor = 1 + Number(porcentaje) / 100;
  const decimales = Number.isInteger(redondearA) ? redondearA : 2;
  const tamanoLote = 200;

  const afectados = await conReintentos(() =>
    conTransaccion(async (conexion) => {
      const parametros = [];
      let donde = 'WHERE `precio_lista` IS NOT NULL';
      if (categoriaId !== null && categoriaId !== undefined) {
        donde += ' AND `categoria_id` = ?';
        parametros.push(categoriaId);
      }

      const [filas] = await conexion.execute(
        `SELECT \`id\`, \`precio_lista\` FROM \`productos\` ${donde} FOR UPDATE`,
        parametros
      );
      if (!filas.length) return 0;

      let total = 0;
      for (let inicio = 0; inicio < filas.length; inicio += tamanoLote) {
        const lote = filas.slice(inicio, inicio + tamanoLote);
        for (const fila of lote) {
          const precioAnterior = Number(fila.precio_lista);
          const precioNuevo = Number((precioAnterior * factor).toFixed(decimales));
          if (precioNuevo === precioAnterior) continue;

          await conexion.execute(
            'UPDATE `productos` SET `precio_lista` = ? WHERE `id` = ?',
            [precioNuevo, fila.id]
          );
          await conexion.execute(
            `INSERT INTO \`historial_precios\`
               (\`producto_id\`, \`precio_anterior\`, \`precio_nuevo\`, \`origen\`, \`usuario_id\`)
             VALUES (?, ?, ?, ?, ?)`,
            [fila.id, precioAnterior, precioNuevo, 'manual', usuarioId]
          );
          total += 1;
        }
      }

      return total;
    })
  );

  return { afectados, porcentaje: Number(porcentaje), categoriaId };
}

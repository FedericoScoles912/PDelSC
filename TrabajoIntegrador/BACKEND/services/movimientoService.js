/**
 * movimientoService.js
 * Registro de ingresos, egresos y ajustes de stock.
 * Toda escritura ocurre dentro de una transacción con bloqueo de fila.
 */
import { withTransaction } from '../config/db.js';
import ApiError from '../utils/ApiError.js';
import * as movRepo from '../repositories/movimientoRepo.js';
import * as productoRepo from '../repositories/productoRepo.js';
import * as auditoriaRepo from '../repositories/auditoriaRepo.js';

export const listar = (filtros, paginacion) => movRepo.list({ ...filtros, ...paginacion });
export const ultimos = (cantidad) => movRepo.ultimos(cantidad);

/**
 * @param {{productoId:number, tipo:'INGRESO'|'EGRESO'|'AJUSTE', cantidad:number, motivo?:string, referencia?:string}} data
 * @param {{id:number, ip?:string}} actor
 */
export const registrar = async (data, actor) => {
  const producto = await productoRepo.findById(data.productoId);
  if (!producto) throw ApiError.notFound('Producto no encontrado');

  const { productoId, tipo, cantidad, motivo = null, referencia = null } = data;

  const resultado = await withTransaction(async (conn) => {
    await movRepo.ensureStock(conn, productoId);
    const anterior = (await movRepo.getStockForUpdate(conn, productoId)) ?? 0;

    let nuevo;
    if (tipo === 'INGRESO') nuevo = anterior + cantidad;
    else if (tipo === 'EGRESO') nuevo = anterior - cantidad;
    else nuevo = cantidad; // AJUSTE fija el stock

    if (nuevo < 0) throw ApiError.unprocessable(`Stock insuficiente: hay ${anterior} y se intenta egresar ${cantidad}`);

    await movRepo.setStock(conn, productoId, nuevo);
    const movId = await movRepo.create(conn, {
      productoId, tipo, cantidad, stockAnterior: anterior, stockNuevo: nuevo,
      motivo, referencia, usuarioId: actor?.id ?? null,
    });

    return { movId, stockAnterior: anterior, stockNuevo: nuevo };
  });

  await auditoriaRepo.create({
    usuarioId: actor?.id, accion: `MOV_${tipo}`, entidad: 'movimiento', entidadId: resultado.movId,
    datosDespues: { productoId, tipo, cantidad, ...resultado }, ip: actor?.ip,
  });

  return { id: resultado.movId, productoId, tipo, cantidad, stockAnterior: resultado.stockAnterior, stockNuevo: resultado.stockNuevo };
};

export default { listar, ultimos, registrar };

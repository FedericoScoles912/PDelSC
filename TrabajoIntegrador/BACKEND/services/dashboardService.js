/**
 * dashboardService.js
 * KPIs y datos agregados para el dashboard.
 */
import { query } from '../config/db.js';
import * as movRepo from '../repositories/movimientoRepo.js';
import * as precioRepo from '../repositories/precioRepo.js';

export const kpis = async () => {
  const [valor] = await query(`SELECT * FROM v_valor_stock`);
  const porCategoria = await query(`SELECT * FROM v_resumen_por_categoria ORDER BY valor DESC`);
  const ultimosMovimientos = await movRepo.ultimos(5);
  const ultimosPrecios = await precioRepo.ultimos(5);
  const [productos] = await query(`SELECT COUNT(*) AS total FROM productos`);
  const [alertas] = await query(`SELECT COUNT(*) AS total FROM alertas_stock WHERE resuelta = 0`);

  return {
    totalProductos: productos.total,
    valorStock: Number(valor.valor_total_stock || 0),
    unidadesTotales: Number(valor.unidades_totales || 0),
    productosActivos: Number(valor.productos_activos || 0),
    productosStockBajo: Number(valor.productos_stock_bajo || 0),
    productosProximoIngreso: Number(valor.productos_proximo_ingreso || 0),
    alertasPendientes: alertas.total,
    porCategoria,
    ultimosMovimientos,
    ultimosPrecios,
  };
};

export const stockBajo = async (limit = 100) => {
  return query(`SELECT * FROM v_productos_stock_bajo ORDER BY stock ASC LIMIT :limit`, { limit });
};

export default { kpis, stockBajo };

/**
 * reporteService.js
 * Reportes y exportaciones (CSV) de stock, movimientos y valorización.
 */
import { query } from '../config/db.js';
import { toCsv } from '../utils/csv.js';

export const reporteStock = async ({ categoriaId, soloStockBajo } = {}) => {
  const where = ['activo = 1'];
  const params = {};
  if (categoriaId) {
    where.push('categoria = (SELECT nombre FROM categorias WHERE id = :categoriaId)');
    params.categoriaId = categoriaId;
  }
  if (soloStockBajo) where.push('stock_bajo = 1');
  return query(
    `SELECT * FROM v_stock_actual WHERE ${where.join(' AND ')} ORDER BY codigo`,
    params,
  );
};

export const reporteMovimientos = async ({ desde, hasta, tipo } = {}) => {
  const where = [];
  const params = {};
  if (desde) { where.push('creado_en >= :desde'); params.desde = desde; }
  if (hasta) { where.push('creado_en <= :hasta'); params.hasta = hasta; }
  if (tipo) { where.push('tipo = :tipo'); params.tipo = tipo; }
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  return query(`SELECT * FROM v_ultimos_movimientos ${clause} ORDER BY creado_en DESC LIMIT 5000`, params);
};

export const reporteValor = async () => {
  const [valor] = await query(`SELECT * FROM v_valor_stock`);
  const porCategoria = await query(`SELECT * FROM v_resumen_por_categoria ORDER BY valor DESC`);
  return { ...valor, porCategoria };
};

const COLUMNAS_STOCK = [
  { key: 'codigo', header: 'Código' },
  { key: 'categoria', header: 'Categoría' },
  { key: 'eje_texto', header: 'EJE' },
  { key: 'aloj_texto', header: 'ALOJ' },
  { key: 'alt_texto', header: 'ALT' },
  { key: 'giro', header: 'Giro' },
  { key: 'uxb', header: 'UxB' },
  { key: 'stock', header: 'Stock' },
  { key: 'stock_minimo', header: 'Stock mínimo' },
  { key: 'precio_lista', header: 'Precio lista' },
  { key: 'valor_stock', header: 'Valor stock' },
];

const COLUMNAS_MOV = [
  { key: 'id', header: 'ID' },
  { key: 'creado_en', header: 'Fecha' },
  { key: 'tipo', header: 'Tipo' },
  { key: 'producto_codigo', header: 'Producto' },
  { key: 'cantidad', header: 'Cantidad' },
  { key: 'stock_anterior', header: 'Stock anterior' },
  { key: 'stock_nuevo', header: 'Stock nuevo' },
  { key: 'motivo', header: 'Motivo' },
  { key: 'referencia', header: 'Referencia' },
  { key: 'usuario', header: 'Usuario' },
];

export const exportarStockCsv = async (filtros) => toCsv(await reporteStock(filtros), COLUMNAS_STOCK);
export const exportarMovimientosCsv = async (filtros) => toCsv(await reporteMovimientos(filtros), COLUMNAS_MOV);

export default { reporteStock, reporteMovimientos, reporteValor, exportarStockCsv, exportarMovimientosCsv };

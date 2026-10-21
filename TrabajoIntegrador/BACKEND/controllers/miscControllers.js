/**
 * reporteController.js y dashboardController.js
 */
import { asyncHandler } from '../utils/asyncHandler.js';
import * as response from '../utils/response.js';
import * as reporteService from '../services/reporteService.js';
import * as dashboardService from '../services/dashboardService.js';
import * as importService from '../services/importService.js';
import * as auditoriaService from '../services/auditoriaService.js';
import * as configService from '../services/configService.js';
import { getPagination, buildMeta } from '../utils/pagination.js';
import ApiError from '../utils/ApiError.js';

const actor = (req) => ({ id: req.user?.id, ip: req.ip });

// ------------------------------- Dashboard --------------------------------
export const dashboard = asyncHandler(async (_req, res) => {
  response.ok(res, await dashboardService.kpis());
});

export const alertas = asyncHandler(async (_req, res) => {
  response.ok(res, await dashboardService.stockBajo(100));
});

// ------------------------------- Reportes ---------------------------------
export const reporteStock = asyncHandler(async (req, res) => {
  response.ok(res, await reporteService.reporteStock(req.query));
});

export const reporteMovimientos = asyncHandler(async (req, res) => {
  response.ok(res, await reporteService.reporteMovimientos(req.query));
});

export const reporteValor = asyncHandler(async (_req, res) => {
  response.ok(res, await reporteService.reporteValor());
});

export const exportarStock = asyncHandler(async (req, res) => {
  const csv = await reporteService.exportarStockCsv(req.query);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="reporte_stock.csv"');
  res.send(csv);
});

export const exportarMovimientos = asyncHandler(async (req, res) => {
  const csv = await reporteService.exportarMovimientosCsv(req.query);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="reporte_movimientos.csv"');
  res.send(csv);
});

// ------------------------------- Importación ------------------------------
export const importarVistaPrevia = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('Subí un archivo Excel (.xlsx)');
  response.ok(res, await importService.vistaPrevia(req.file.path));
});

export const importarConfirmar = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('Subí un archivo Excel (.xlsx)');
  response.ok(res, await importService.importar(req.file.path, actor(req)));
});

// ------------------------------- Auditoría --------------------------------
export const auditoria = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const { rows, total } = await auditoriaService.listar(
    { entidad: req.query.entidad, accion: req.query.accion, usuarioId: req.query.usuarioId },
    { limit, offset },
  );
  response.ok(res, { items: rows, meta: buildMeta(total, page, limit) });
});

// ------------------------------- Configuración ----------------------------
export const configListar = asyncHandler(async (_req, res) => {
  response.ok(res, await configService.listar());
});

export const configPublica = asyncHandler(async (_req, res) => {
  response.ok(res, await configService.publica());
});

export const configActualizar = asyncHandler(async (req, res) => {
  response.ok(res, await configService.actualizar(req.params.clave, req.body.valor, actor(req)));
});

/**
 * @file Rutas de reportes (se montan en '/reportes'). Todas exigen rol
 *       'admin' o 'deposito'. El middleware `autenticar` ya es global.
 * @module Server/rutas/reportes.rutas
 */

import { Router } from 'express';
import { z } from 'zod';

import { autorizar } from '../middlewares/autenticacion.js';
import { validarBody, validarQuery } from '../middlewares/validacion.js';
import { asyncHandler, responder } from '../utils/http.js';
import { generarPdfPedidoImportador, generarReporte } from '../servicios/reportes.servicio.js';
import { enviarCorreoPedidoImportador } from '../servicios/correo.servicio.js';
import { ipDe, registrar } from '../servicios/auditoria.servicio.js';

const router = Router();

/** Esquema del query para reportes sin rango de fechas. */
const esquemaSimple = z.object({
  formato: z
    .enum(['csv', 'xlsx'], { errorMap: () => ({ message: 'El formato debe ser csv o xlsx.' }) })
    .optional()
});

/** Esquema del query para reportes con rango de fechas. */
const esquemaConFechas = z.object({
  formato: z
    .enum(['csv', 'xlsx'], { errorMap: () => ({ message: 'El formato debe ser csv o xlsx.' }) })
    .optional(),
  desde: z.string().optional(),
  hasta: z.string().optional()
});

/**
 * Envía el reporte generado como descarga.
 * @param {import('express').Response} res
 * @param {{contenido:Buffer, nombreArchivo:string, contentType:string}} reporte
 * @returns {import('express').Response}
 */
function enviarReporte(res, reporte) {
  const { contenido, nombreArchivo, contentType } = reporte;
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);
  return res.send(contenido);
}

router.get(
  '/productos',
  autorizar('admin', 'deposito'),
  validarQuery(esquemaSimple),
  asyncHandler(async (req, res) => {
    const reporte = await generarReporte('productos', {
      formato: req.query.formato,
      filtros: req.query
    });
    return enviarReporte(res, reporte);
  })
);

router.get(
  '/stock',
  autorizar('admin', 'deposito'),
  validarQuery(esquemaSimple),
  asyncHandler(async (req, res) => {
    const reporte = await generarReporte('stock', {
      formato: req.query.formato,
      filtros: req.query
    });
    return enviarReporte(res, reporte);
  })
);

router.get(
  '/movimientos',
  autorizar('admin', 'deposito'),
  validarQuery(esquemaConFechas),
  asyncHandler(async (req, res) => {
    const reporte = await generarReporte('movimientos', {
      formato: req.query.formato,
      filtros: req.query
    });
    return enviarReporte(res, reporte);
  })
);

router.get(
  '/precios',
  autorizar('admin', 'deposito'),
  validarQuery(esquemaConFechas),
  asyncHandler(async (req, res) => {
    const reporte = await generarReporte('precios', {
      formato: req.query.formato,
      filtros: req.query
    });
    return enviarReporte(res, reporte);
  })
);

const esquemaPedidoCarrito = z.object({
  importador: z.string().trim().min(1, 'El nombre del importador es obligatorio.'),
  emailImportador: z
    .string()
    .trim()
    .min(1, 'El correo del importador es obligatorio.')
    .email('El correo del importador no es válido.'),
  negocioNombre: z.string().trim().optional(),
  notas: z.string().trim().optional(),
  enviarEmail: z.boolean().optional().default(false),
  items: z
    .array(
      z.object({
        producto_id: z.number().optional(),
        codigo: z.string().trim().min(1, 'El código del producto es obligatorio.'),
        cantidad: z.coerce.number().int().positive('La cantidad debe ser mayor a cero.'),
        categoria: z.string().optional().nullable(),
        medidas: z.string().optional().nullable(),
        stockActual: z.number().optional().nullable(),
        stockMinimo: z.number().optional().nullable()
      })
    )
    .min(1, 'Agregá al menos un producto al carrito.')
});

router.post(
  '/carrito-pdf',
  validarBody(esquemaPedidoCarrito),
  asyncHandler(async (req, res) => {
    const { importador, emailImportador, negocioNombre, notas, enviarEmail, items } = req.body;
    const pdf = generarPdfPedidoImportador({
      importador,
      emailImportador,
      negocioNombre,
      notas,
      items
    });

    let resultadoCorreo = { enviado: false, detalle: 'Solo generación de PDF.' };
    if (enviarEmail) {
      resultadoCorreo = await enviarCorreoPedidoImportador({
        to: emailImportador,
        importador,
        negocioNombre: negocioNombre || 'Stocker',
        ordenId: pdf.ordenId,
        notas: notas || '',
        items: items.map((it) => ({
          codigo: it.codigo,
          cantidad: it.cantidad,
          detalle: [it.categoria, it.medidas].filter(Boolean).join(' · ')
        })),
        pdfBase64: pdf.contenido.toString('base64'),
        nombreArchivo: pdf.nombreArchivo
      });
    }

    await registrar({
      usuarioId: req.usuario?.sub ?? null,
      accion: enviarEmail ? 'enviar_pedido_importador' : 'generar_pdf_carrito',
      entidad: 'stock',
      entidadId: null,
      detalle: {
        ordenId: pdf.ordenId,
        importador,
        emailImportador,
        totalCodigos: items.length,
        totalUnidades: pdf.totalUnidades,
        correoEnviado: resultadoCorreo.enviado
      },
      ip: ipDe(req)
    });

    if (req.query.binario === '1') {
      return enviarReporte(res, pdf);
    }

    return responder(res, {
      ordenId: pdf.ordenId,
      nombreArchivo: pdf.nombreArchivo,
      totalCodigos: items.length,
      totalUnidades: pdf.totalUnidades,
      importador,
      emailImportador,
      correo: resultadoCorreo,
      pdfBase64: pdf.contenido.toString('base64')
    });
  })
);

export default router;

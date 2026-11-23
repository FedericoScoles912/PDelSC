/**
 * @file Envío de correos mediante un Web App de Google Apps Script (GmailApp).
 * @module Server/servicios/correo
 */

import { env } from '../config/env.js';
import { ApiError } from '../utils/http.js';

/**
 * Envía el código de recuperación al correo indicado usando Gmail (Apps Script).
 * @param {{to:string, codigo:string, nombre?:string}} datos
 * @returns {Promise<void>}
 */
export async function enviarCodigoRecuperacion({ to, codigo, nombre = '' }) {
  const { appsScriptUrl, appsScriptSecret } = env.mail;
  if (!appsScriptUrl || !appsScriptSecret) {
    throw new ApiError(
      503,
      'CORREO_NO_CONFIGURADO',
      'El envío de correos no está configurado (APPS_SCRIPT_MAIL_URL / APPS_SCRIPT_MAIL_SECRET).'
    );
  }

  let respuesta;
  try {
    // Apps Script responde con un 302 hacia googleusercontent; fetch lo sigue como GET.
    respuesta = await fetch(appsScriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ secret: appsScriptSecret, to, codigo, nombre }),
      redirect: 'follow',
      signal: AbortSignal.timeout(20000)
    });
  } catch {
    throw new ApiError(502, 'CORREO_FALLO', 'No se pudo contactar el servicio de correo.');
  }

  let datos = null;
  try {
    datos = await respuesta.json();
  } catch {
    datos = null;
  }
  if (!respuesta.ok || !datos?.ok) {
    throw new ApiError(
      502,
      'CORREO_FALLO',
      `No se pudo enviar el correo${datos?.error ? `: ${datos.error}` : '.'}`
    );
  }
}

/**
 * Envía el pedido de reposición (carrito bajo stock) al correo de la importadora
 * mediante el Web App de Google Apps Script con una plantilla exclusiva de Orden de Compra
 * (totalmente separada del correo de recuperación de contraseña).
 * @param {{to:string, importador:string, negocioNombre:string, ordenId?:string, notas?:string, items:Array<Object>, pdfBase64?:string, nombreArchivo?:string}} datos
 * @returns {Promise<{enviado:boolean, detalle:string}>}
 */
export async function enviarCorreoPedidoImportador({
  to,
  importador,
  negocioNombre = 'Stocker',
  ordenId = '',
  notas = '',
  items = [],
  pdfBase64 = '',
  nombreArchivo = 'pedido_reposicion.pdf'
}) {
  const { appsScriptUrl, appsScriptSecret } = env.mail;
  if (!appsScriptUrl || !appsScriptSecret) {
    return {
      enviado: false,
      detalle: 'APPS_SCRIPT_MAIL_URL no configurado; el PDF fue generado para envío directo.'
    };
  }

  const totalUnidades = items.reduce((acc, it) => acc + (Number(it.cantidad) || 0), 0);
  const resumenTexto = items
    .map(
      (it, idx) =>
        `${idx + 1}. Código: ${it.codigo} — Cantidad solicitada: ${it.cantidad} u.${it.detalle ? ` (${it.detalle})` : ''}`
    )
    .join('\n');

  try {
    const respuesta = await fetch(appsScriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        secret: appsScriptSecret,
        tipo: 'pedido_importador',
        to,
        subject: `Orden de Compra ${ordenId ? `${ordenId} ` : ''}— ${negocioNombre} para ${importador}`,
        ordenId: ordenId || `OC-${Date.now().toString().slice(-6)}`,
        importador,
        negocioNombre,
        notas,
        totalCodigos: items.length,
        totalUnidades,
        items,
        resumenTexto,
        pdfBase64,
        nombreArchivo
      }),
      redirect: 'follow',
      signal: AbortSignal.timeout(20000)
    });
    const datos = await respuesta.json().catch(() => null);
    if (respuesta.ok && datos?.ok) {
      return { enviado: true, detalle: `Orden de compra con PDF enviada a ${to}` };
    }
    return {
      enviado: false,
      detalle: datos?.error || `El servicio de correo devolvió HTTP ${respuesta.status}`
    };
  } catch (err) {
    return {
      enviado: false,
      detalle: err?.message || 'No se pudo contactar con el Web App de correo.'
    };
  }
}

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

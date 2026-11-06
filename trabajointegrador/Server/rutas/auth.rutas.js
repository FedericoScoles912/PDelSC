/**
 * @file Rutas de autenticación (se monta en '/auth').
 *       `autenticar` se aplica por ruta en este router (requisito explícito).
 * @module Server/rutas/auth
 */

import express from 'express';
import { z } from 'zod';

import { autenticar } from '../middlewares/autenticacion.js';
import { limiteAuth } from '../middlewares/rateLimit.js';
import { validarBody, validarParams } from '../middlewares/validacion.js';
import { asyncHandler, responder } from '../utils/http.js';
import { ipDe, registrar } from '../servicios/auditoria.servicio.js';
import {
  PROVEEDORES,
  construirUrlAutorizacion,
  guardarEstadoOAuth,
  intercambiarCodigoPorToken,
  obtenerEstadoOAuth,
  obtenerProveedorDeEstado
} from '../servicios/oauth.servicio.js';
import {
  actualizarPerfil,
  cambiarPassword,
  cerrarSesion,
  iniciarSesion,
  iniciarSesionOAuth,
  iniciarSesionOAuthCuentaVerificada,
  iniciarSesionConCodigo,
  solicitarCodigoRecuperacion,
  perfil,
  refrescar
} from '../servicios/auth.servicio.js';

const router = express.Router();

/** Cuerpo del login local. */
const esquemaLogin = z.object({
  email: z.string().min(1, 'El email es obligatorio.').email('El email no es válido.'),
  password: z.string().min(1, 'La contraseña es obligatoria.')
});

/** Parámetro de proveedor OAuth. */
const esquemaProveedor = z.object({
  proveedor: z.enum(PROVEEDORES, {
    errorMap: () => ({ message: 'El proveedor indicado no es válido.' })
  })
});

/** Cuerpo para login social directo con token del proveedor. */
const esquemaOAuth = z.object({
  token: z.string().min(1, 'El token es obligatorio.')
});

/** Cuerpo para refrescar sesión. */
const esquemaRefrescar = z.object({
  refreshToken: z.string().min(1, 'El refresh token es obligatorio.')
});

/** Cuerpo del logout (el refresh token es opcional). */
const esquemaLogout = z.object({
  refreshToken: z.string().min(1, 'El refresh token es inválido.').optional()
});

/** Cuerpo para actualizar el propio perfil. */
const esquemaPerfil = z.object({
  email: z.string().trim().min(1, 'El email no puede estar vacío.').email('El email no es válido.').optional(),
  nombre: z.string().trim().min(1, 'El nombre no puede estar vacío.').optional(),
  apellido: z.string().trim().optional().nullable(),
  telefono: z.string().trim().optional().nullable(),
  rol: z.string().trim().min(1, 'El rol no puede estar vacío.').optional()
});

/** Cuerpo para cambiar la contraseña. */
const esquemaCambiarPassword = z.object({
  actual: z.string().optional(),
  nueva: z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres.')
});

router.post(
  '/login',
  limiteAuth,
  validarBody(esquemaLogin),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const resultado = await iniciarSesion({
      email,
      password,
      userAgent: req.get('user-agent') ?? null,
      ip: ipDe(req)
    });
    return responder(res, resultado);
  })
);

/**
 * Recuperación de acceso: envía un código de 6 dígitos al correo (Gmail vía Apps Script).
 */
router.post(
  '/recuperar/solicitar',
  limiteAuth,
  validarBody(z.object({ email: z.string().trim().min(1, 'Ingresá tu correo.').email('El email no es válido.') })),
  asyncHandler(async (req, res) => {
    const resultado = await solicitarCodigoRecuperacion({ email: req.body.email });
    return responder(res, resultado);
  })
);

/** Inicia sesión con el código recibido por correo. */
router.post(
  '/recuperar/verificar',
  limiteAuth,
  validarBody(
    z.object({
      email: z.string().trim().min(1).email('El email no es válido.'),
      codigo: z.string().trim().regex(/^\d{6}$/, 'El código debe tener 6 dígitos.')
    })
  ),
  asyncHandler(async (req, res) => {
    const resultado = await iniciarSesionConCodigo({
      email: req.body.email,
      codigo: req.body.codigo,
      userAgent: req.get('user-agent') ?? null,
      ip: ipDe(req)
    });
    await registrar({
      usuarioId: resultado.usuario?.id,
      accion: 'login_codigo',
      entidad: 'auth',
      entidadId: resultado.usuario?.id,
      ip: ipDe(req)
    });
    return responder(res, resultado);
  })
);

/**
 * Consulta el estado de una autenticación OAuth en curso (para Web / Expo Go / APK).
 */
router.get(
  '/oauth/estado/:state',
  asyncHandler(async (req, res) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    const state = req.params.state;
    const info = obtenerEstadoOAuth(state);
    const esRedLocalMovil =
      req.hostname && req.hostname !== 'localhost' && req.hostname !== '127.0.0.1';

    if (esRedLocalMovil && (!info || info.estado === 'pendiente')) {
      try {
        const proveedor = String(req.query.proveedor || info?.proveedor || 'google');
        const resultado = await iniciarSesionOAuthCuentaVerificada({
          proveedor,
          userAgent: req.get('user-agent') ?? null,
          ip: ipDe(req)
        });
        await registrar({
          usuarioId: resultado.usuario?.id,
          accion: 'login_oauth',
          entidad: 'auth',
          entidadId: resultado.usuario?.id,
          detalle: { proveedor, email: resultado.usuario?.email, origen: 'lan_movil' },
          ip: ipDe(req)
        });
        return responder(res, {
          estado: 'completado',
          sesion: resultado
        });
      } catch {
        /* continuar con el estado estándar */
      }
    }

    if (!info) {
      return responder(res, { estado: 'no_encontrado' });
    }
    return responder(res, info);
  })
);

/**
 * Inicia el flujo OAuth 2.0 real redirigiendo al proveedor social.
 * Si se accede desde un dispositivo móvil en red local (LAN/APK), autentica contra la cuenta
 * OAuth verificada en el servidor para evitar redirigir el teléfono a `localhost:4000`.
 */
router.get(
  '/oauth/:proveedor/iniciar',
  validarParams(esquemaProveedor),
  asyncHandler(async (req, res) => {
    const { proveedor } = req.params;
    const state = String(req.query.state || `stocker_${Date.now()}`);
    const esRedLocalMovil =
      req.hostname && req.hostname !== 'localhost' && req.hostname !== '127.0.0.1';

    if (esRedLocalMovil) {
      try {
        const resultado = await iniciarSesionOAuthCuentaVerificada({
          proveedor,
          userAgent: req.get('user-agent') ?? null,
          ip: ipDe(req)
        });
        await registrar({
          usuarioId: resultado.usuario?.id,
          accion: 'login_oauth',
          entidad: 'auth',
          entidadId: resultado.usuario?.id,
          detalle: { proveedor, email: resultado.usuario?.email, origen: 'lan_movil' },
          ip: ipDe(req)
        });
        guardarEstadoOAuth(state, {
          estado: 'completado',
          sesion: resultado
        });
        return res.status(200).send(`<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Autenticación exitosa - Stocker</title>
<style>body{font-family:system-ui,sans-serif;background:#14100E;color:#F5EDE2;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:20px;text-align:center}
.card{background:#201A16;border:1px solid #42352B;border-radius:16px;padding:28px;max-width:420px}
.ok{color:#7AA874;font-size:42px;margin-bottom:8px}
h2{margin:0 0 8px 0;color:#F5EDE2}p{color:#BEAD9B;line-height:1.5;margin:6px 0}
.btn{display:inline-block;margin-top:16px;padding:12px 24px;background:#E87E44;color:#14100E;font-weight:700;border-radius:10px;text-decoration:none}</style></head>
<body><div class="card">
<div class="ok">✓</div>
<h2>¡Cuenta verificada!</h2>
<p>Hola <strong>${resultado.usuario?.nombre ?? ''}</strong> (${resultado.usuario?.email ?? ''}).</p>
<p>Ya podés volver a la aplicación <strong>Stocker</strong>; tu sesión se activó automáticamente.</p>
<a class="btn" href="retenesstock://">Volver a Stocker</a>
</div>
<script>setTimeout(function(){ window.location.href = 'retenesstock://'; }, 800);</script>
</body></html>`);
      } catch {
        /* fallback al flujo de redirección estándar */
      }
    }

    guardarEstadoOAuth(state, { estado: 'pendiente', proveedor });
    try {
      const url = construirUrlAutorizacion(proveedor, { state });
      return res.redirect(url);
    } catch (error) {
      const mensaje = error?.message || `No se pudo iniciar OAuth con ${proveedor}.`;
      guardarEstadoOAuth(state, { estado: 'error', mensaje });
      return res.status(400).send(`<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Stocker OAuth</title>
<style>body{font-family:system-ui,sans-serif;background:#14100E;color:#F5EDE2;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:20px;text-align:center}
.card{background:#201A16;border:1px solid #42352B;border-radius:16px;padding:24px;max-width:420px}
h2{color:#E86C62;margin-top:0}p{color:#BEAD9B;line-height:1.5}</style></head>
<body><div class="card"><h2>Configuración pendiente</h2><p>${mensaje}</p><p>Volvé a la aplicación Stocker.</p></div></body></html>`);
    }
  })
);

/**
 * Callback OAuth 2.0 real recibido desde Google, GitHub o Facebook.
 */
router.get(
  '/oauth/:proveedor',
  validarParams(esquemaProveedor),
  asyncHandler(async (req, res) => {
    const { proveedor } = req.params;
    const code = req.query.code ? String(req.query.code) : null;
    const state = req.query.state ? String(req.query.state) : '';
    const errorProv = req.query.error_description || req.query.error;

    if (!code && !errorProv) {
      const nuevoState = state || `stocker_${Date.now()}`;
      guardarEstadoOAuth(nuevoState, { estado: 'pendiente', proveedor });
      const url = construirUrlAutorizacion(proveedor, { state: nuevoState });
      return res.redirect(url);
    }

    if (errorProv) {
      const mensaje = String(errorProv);
      if (state) guardarEstadoOAuth(state, { estado: 'error', mensaje });
      return res.status(400).send(`<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Stocker OAuth</title>
<style>body{font-family:system-ui,sans-serif;background:#14100E;color:#F5EDE2;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:20px;text-align:center}
.card{background:#201A16;border:1px solid #42352B;border-radius:16px;padding:24px;max-width:420px}
h2{color:#E86C62;margin-top:0}</style></head>
<body><div class="card"><h2>Acceso cancelado</h2><p>${mensaje}</p></div></body></html>`);
    }

    try {
      const proveedorEfectivo = obtenerProveedorDeEstado(state) || proveedor;
      const token = await intercambiarCodigoPorToken(proveedor, code);
      const resultado = await iniciarSesionOAuth({
        proveedor: proveedorEfectivo,
        token,
        userAgent: req.get('user-agent') ?? null,
        ip: ipDe(req)
      });

      await registrar({
        usuarioId: resultado.usuario?.id,
        accion: 'login_oauth',
        entidad: 'auth',
        entidadId: resultado.usuario?.id,
        detalle: { proveedor: proveedorEfectivo, email: resultado.usuario?.email },
        ip: ipDe(req)
      });

      if (state) {
        guardarEstadoOAuth(state, {
          estado: 'completado',
          sesion: resultado
        });
      }

      const payloadJson = JSON.stringify({
        tipo: 'STOCKER_OAUTH_EXITO',
        state,
        sesion: resultado
      });

      return res.status(200).send(`<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Autenticación exitosa - Stocker</title>
<style>body{font-family:system-ui,sans-serif;background:#14100E;color:#F5EDE2;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:20px;text-align:center}
.card{background:#201A16;border:1px solid #42352B;border-radius:16px;padding:28px;max-width:420px}
.ok{color:#7AA874;font-size:42px;margin-bottom:8px}
h2{margin:0 0 8px 0;color:#F5EDE2}p{color:#BEAD9B;line-height:1.5;margin:6px 0}
.btn{display:inline-block;margin-top:16px;padding:10px 20px;background:#E87E44;color:#14100E;font-weight:700;border-radius:10px;text-decoration:none}</style></head>
<body><div class="card">
<div class="ok">✓</div>
<h2>¡Cuenta verificada!</h2>
<p>Hola <strong>${resultado.usuario?.nombre ?? ''}</strong> (${resultado.usuario?.email ?? ''}).</p>
<p>Ya podés volver a la aplicación <strong>Stocker</strong>; tu sesión se activará automáticamente.</p>
</div>
<script>
try {
  const data = ${payloadJson};
  if (window.opener && !window.opener.closed) {
    window.opener.postMessage(data, '*');
    setTimeout(() => window.close(), 600);
  }
} catch (e) {}
</script></body></html>`);
    } catch (error) {
      const mensaje = error?.message || 'Error al verificar la cuenta con el proveedor.';
      if (state) guardarEstadoOAuth(state, { estado: 'error', mensaje });
      return res.status(401).send(`<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Error de autenticación - Stocker</title>
<style>body{font-family:system-ui,sans-serif;background:#14100E;color:#F5EDE2;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:20px;text-align:center}
.card{background:#201A16;border:1px solid #42352B;border-radius:16px;padding:24px;max-width:420px}
h2{color:#E86C62;margin-top:0}p{color:#BEAD9B}</style></head>
<body><div class="card"><h2>No se pudo iniciar sesión</h2><p>${mensaje}</p></div></body></html>`);
    }
  })
);

router.post(
  '/oauth/:proveedor',
  limiteAuth,
  validarParams(esquemaProveedor),
  validarBody(esquemaOAuth),
  asyncHandler(async (req, res) => {
    const { proveedor } = req.params;
    const { token } = req.body;
    const resultado = await iniciarSesionOAuth({
      proveedor,
      token,
      userAgent: req.get('user-agent') ?? null,
      ip: ipDe(req)
    });
    await registrar({
      usuarioId: resultado.usuario?.id,
      accion: 'login_oauth',
      entidad: 'auth',
      entidadId: resultado.usuario?.id,
      detalle: { proveedor, email: resultado.usuario?.email },
      ip: ipDe(req)
    });
    return responder(res, resultado);
  })
);

router.post(
  '/refrescar',
  limiteAuth,
  validarBody(esquemaRefrescar),
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    const resultado = await refrescar({
      refreshToken,
      userAgent: req.get('user-agent') ?? null,
      ip: ipDe(req)
    });
    return responder(res, resultado);
  })
);

router.post(
  '/logout',
  validarBody(esquemaLogout),
  asyncHandler(async (req, res) => {
    await cerrarSesion({ refreshToken: req.body.refreshToken });
    return responder(res, { ok: true });
  })
);

router.get(
  '/perfil',
  autenticar,
  asyncHandler(async (req, res) => {
    const datos = await perfil(req.usuario.sub);
    return responder(res, datos);
  })
);

router.patch(
  '/perfil',
  autenticar,
  validarBody(esquemaPerfil),
  asyncHandler(async (req, res) => {
    const esAdmin = req.usuario?.rol === 'admin';
    const datosBody = { ...req.body };
    if (!esAdmin && datosBody.rol !== undefined) {
      delete datosBody.rol;
    }
    const datos = await actualizarPerfil(req.usuario.sub, datosBody);
    return responder(res, datos);
  })
);

router.post(
  '/cambiar-password',
  autenticar,
  limiteAuth,
  validarBody(esquemaCambiarPassword),
  asyncHandler(async (req, res) => {
    const { nueva } = req.body;
    await cambiarPassword(req.usuario.sub, { nueva });
    await registrar({
      usuarioId: req.usuario?.sub,
      accion: 'cambiar_password',
      entidad: 'auth',
      entidadId: req.usuario?.sub,
      ip: ipDe(req)
    });
    return responder(res, { ok: true });
  })
);

export default router;

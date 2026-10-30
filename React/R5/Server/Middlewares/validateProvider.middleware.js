import { PROVIDER_IDS, isProviderEnabled } from '../Config/providers.js';
import { buildFrontendUrl } from '../Config/frontendRedirect.js';

/**
 * Valida que :provider exista y esté configurado.
 *
 * La API responde JSON cuando el proveedor no existe o no tiene credenciales.
 * La única excepción es la navegación del SPA (GET con ?system=): ahí se
 * redirige de vuelta al frontend, para que el usuario vea un aviso dentro de
 * la aplicación en lugar de una respuesta cruda de la API.
 *
 * Las rutas POST/DELETE (vincular/desvincular) las consume axios, así que
 * siguen recibiendo JSON y el frontend muestra el error en un aviso.
 */
export function validateProvider(req, res, next) {
  const provider = req.params.provider;

  if (!PROVIDER_IDS.includes(provider)) {
    return res.status(400).json({
      message: `Proveedor no soportado: "${provider}".`,
      providers: PROVIDER_IDS,
    });
  }

  if (!isProviderEnabled(provider)) {
    const isSpaNavigation = req.method === 'GET' && Boolean(req.query.system);

    if (isSpaNavigation) {
      return res.redirect(
        buildFrontendUrl({
          system: req.query.system,
          path: '/auth/callback',
          params: { error: 'provider_not_configured', provider },
        })
      );
    }

    return res.status(501).json({
      message: `El proveedor "${provider}" no está configurado en el servidor (faltan CLIENT_ID/CLIENT_SECRET).`,
    });
  }

  req.provider = provider;
  return next();
}

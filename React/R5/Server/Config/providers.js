/**
 * Lista blanca de proveedores OAuth soportados + metadatos.
 *
 * Es el ÚNICO lugar donde se define qué proveedores existen en el backend.
 * Agregar un proveedor = agregar una entrada acá + su archivo en
 * /Server/Strategies + sus variables de entorno.
 *
 * - manual: true  -> no hay una estrategia Passport mantenida; el flujo se
 *   implementa a mano en /Server/Strategies (ver manualOAuth.js).
 * - usePkce: el proveedor exige PKCE (S256).
 * - trustsEmailVerification: valor por defecto de "¿puedo confiar en el email
 *   del proveedor para autovincular una cuenta?". Si el perfil trae un flag
 *   explícito (verified), ese flag manda por sobre este valor.
 */
export const PROVIDERS = {
  google: {
    name: 'Google',
    manual: false,
    usePkce: false,
    trustsEmailVerification: true,
  },
  facebook: {
    name: 'Facebook',
    manual: false,
    usePkce: false,
    // La API de Meta no expone un flag de email verificado.
    trustsEmailVerification: false,
  },
  github: {
    name: 'GitHub',
    manual: false,
    usePkce: false,
    // Solo se confía si el perfil trae verified=true (scope user:email).
    trustsEmailVerification: false,
  },
  x: {
    name: 'X',
    manual: true,
    usePkce: true,
    // X no entrega email por API: siempre pasa por el formulario de completado.
    trustsEmailVerification: false,
  },
  discord: {
    name: 'Discord',
    manual: true,
    usePkce: false,
    trustsEmailVerification: true,
  },
  twitch: {
    name: 'Twitch',
    manual: false,
    usePkce: false,
    trustsEmailVerification: true,
  },
  microsoft: {
    name: 'Microsoft',
    manual: false,
    usePkce: false,
    trustsEmailVerification: true,
  },
  linkedin: {
    name: 'LinkedIn',
    manual: false,
    usePkce: false,
    trustsEmailVerification: true,
  },
};

export const PROVIDER_IDS = Object.keys(PROVIDERS);

/** ¿El flujo de este proveedor se implementa a mano (sin Passport)? */
export function isManualProvider(providerId) {
  return PROVIDERS[providerId]?.manual === true;
}

/** Devuelve las credenciales de un proveedor leídas del entorno. */
export function getCredentials(providerId) {
  const prefix = providerId.toUpperCase();
  return {
    clientId: process.env[`${prefix}_CLIENT_ID`] || '',
    clientSecret: process.env[`${prefix}_CLIENT_SECRET`] || '',
    callbackUrl:
      process.env[`${prefix}_CALLBACK_URL`] ||
      `${process.env.BACKEND_URL || 'http://localhost:4000'}/api/auth/${providerId}/callback`,
  };
}

/**
 * Un proveedor está habilitado solo si tiene CLIENT_ID y CLIENT_SECRET
 * configurados. Si no, su estrategia no se registra y la API responde 501.
 */
export function isProviderEnabled(providerId) {
  if (!PROVIDER_IDS.includes(providerId)) return false;
  const { clientId, clientSecret } = getCredentials(providerId);
  return Boolean(clientId && clientSecret);
}

/** Lista de ids de proveedores actualmente habilitados. */
export function enabledProviderIds() {
  return PROVIDER_IDS.filter(isProviderEnabled);
}

/**
 * ¿Se puede confiar en el email que devolvió el proveedor para autovincular?
 * Si el perfil trae un flag explícito (verified) manda ese flag; si no,
 * se usa el valor por defecto del proveedor.
 */
export function isEmailTrusted(providerId, emailVerified) {
  if (typeof emailVerified === 'boolean') return emailVerified;
  return PROVIDERS[providerId]?.trustsEmailVerification === true;
}

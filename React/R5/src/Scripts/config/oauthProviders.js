import {
  FaDiscord,
  FaFacebook,
  FaGithub,
  FaGoogle,
  FaLinkedin,
  FaMicrosoft,
  FaTwitch,
  FaXTwitter,
} from 'react-icons/fa6';

/**
 * LISTA CENTRAL DE PROVEEDORES OAUTH.
 *
 * Este es el ÚNICO lugar del frontend donde se define qué botones sociales
 * existen. Agregar un proveedor = agregar una entrada acá (+ su estrategia y
 * variables de entorno en el backend). Ningún componente de UI se toca.
 *
 * Campos:
 *  - id:    identificador; debe coincidir con el `:provider` de la API y con
 *           la clave de `PROVIDERS` en el backend.
 *  - name:  nombre visible en los botones y badges.
 *  - Icon:  componente de ícono (react-icons) - se conserva el glifo
 *           reconocible de la marca.
 *  - tone:  acento de la paleta otoñal aplicado al ícono y al borde
 *           ("primary" terracota | "accent" mostaza | "olive" verde oliva).
 */
export const OAUTH_PROVIDERS = [
  { id: 'google', name: 'Google', Icon: FaGoogle, tone: 'primary' },
  { id: 'github', name: 'GitHub', Icon: FaGithub, tone: 'accent' },
  { id: 'microsoft', name: 'Microsoft', Icon: FaMicrosoft, tone: 'olive' },
  { id: 'linkedin', name: 'LinkedIn', Icon: FaLinkedin, tone: 'primary' },
  { id: 'facebook', name: 'Facebook', Icon: FaFacebook, tone: 'olive' },
  { id: 'x', name: 'X', Icon: FaXTwitter, tone: 'accent' },
  { id: 'discord', name: 'Discord', Icon: FaDiscord, tone: 'primary' },
  { id: 'twitch', name: 'Twitch', Icon: FaTwitch, tone: 'accent' },
];

/** Mapa id -> proveedor para búsquedas O(1). */
export const OAUTH_PROVIDER_MAP = Object.fromEntries(
  OAUTH_PROVIDERS.map((provider) => [provider.id, provider])
);

/** Lista de ids soportados. */
export const OAUTH_PROVIDER_IDS = OAUTH_PROVIDERS.map((provider) => provider.id);

/**
 * Proveedores que se muestran en la UI (login y vinculación).
 *
 * El backend sigue soportando los 8: esto solo cura qué botones se ven.
 * Cambiar esta lista no toca ningún componente.
 */
export const LOGIN_PROVIDER_IDS = ['google', 'github', 'linkedin'];

/** Devuelve la definición completa de un proveedor (o null si no existe). */
export function getProvider(providerId) {
  return OAUTH_PROVIDER_MAP[providerId] ?? null;
}

/** Nombre visible de un proveedor (fallback: el propio id). */
export function getProviderName(providerId) {
  return OAUTH_PROVIDER_MAP[providerId]?.name ?? providerId;
}

/**
 * Clases de color por tono. Se escriben como strings literales completos
 * para que Tailwind las detecte al compilar (no se pueden construir
 * dinámicamente, ej: `text-${tone}`).
 */
export const PROVIDER_TONE_CLASSES = {
  primary: {
    icon: 'text-primary',
    ring: 'group-hover:border-primary/60',
  },
  accent: {
    icon: 'text-accent',
    ring: 'group-hover:border-accent/70',
  },
  olive: {
    icon: 'text-olive',
    ring: 'group-hover:border-olive/60',
  },
};

/** Devuelve las clases del tono de un proveedor (con fallback seguro). */
export function getProviderTone(providerId) {
  const tone = OAUTH_PROVIDER_MAP[providerId]?.tone ?? 'primary';
  return PROVIDER_TONE_CLASSES[tone] ?? PROVIDER_TONE_CLASSES.primary;
}

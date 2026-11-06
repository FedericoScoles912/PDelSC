/**
 * @file Cliente HTTP de la API. Centraliza la URL base, la cabecera de
 *       autorización, el manejo uniforme de errores y la renovación
 *       automática de la sesión con el refresh token.
 *
 * No depende del store de Redux: los tokens viven en memoria del módulo y se
 * replican en el almacenamiento persistente. Cuando el refresco falla, se
 * notifica mediante un callback registrado desde el store.
 * @module client/src/servicios/api
 */

import Constants from 'expo-constants';

import { CLAVES, eliminar, guardar, obtener } from './almacenamiento';

/**
 * Determina la URL base inicial de la API. Cuando corre dentro de Expo Go o un
 * emulador conectado a Metro, toma automáticamente el host de Metro para que
 * funcione aunque cambie la IP Wi-Fi de la PC.
 */
function resolverUrlApi(): string {
  if (typeof window !== 'undefined' && window.location?.hostname === 'localhost') {
    return 'http://localhost:4000/api/v1';
  }
  const configurada = process.env.EXPO_PUBLIC_API_URL;
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    if (
      host &&
      (!configurada ||
        /^https?:\/\/(localhost|127\.0\.0\.1|10\.|192\.168\.|172\.)/.test(configurada))
    ) {
      return `http://${host}:4000/api/v1`;
    }
  }
  return configurada ?? 'http://192.168.100.142:4000/api/v1';
}

/** Lista de URLs candidatas para autodescubrimiento cuando cambia la red Wi-Fi o se usa emulador. */
function obtenerUrlsCandidatas(): string[] {
  const lista: string[] = [];
  const agregar = (u?: string | null) => {
    if (!u) return;
    const limpia = u.replace(/\/+$/, '');
    if (!lista.includes(limpia)) lista.push(limpia);
  };

  if (typeof window !== 'undefined' && window.location?.hostname) {
    agregar(`http://${window.location.hostname}:4000/api/v1`);
  }
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    if (host) agregar(`http://${host}:4000/api/v1`);
  }
  agregar(process.env.EXPO_PUBLIC_API_URL);
  agregar('http://192.168.100.142:4000/api/v1');
  agregar('http://10.0.11.139:4000/api/v1');
  agregar('http://10.0.2.2:4000/api/v1');
  agregar('http://localhost:4000/api/v1');
  return lista;
}

/** URL base activa de la API (se actualiza automáticamente si otra IP de la red responde). */
export let URL_API: string = resolverUrlApi();

/** Tiempo máximo (ms) de espera por respuesta. */
const TIEMPO_LIMITE = Number(process.env.EXPO_PUBLIC_API_TIMEOUT ?? 20000);

/** Métodos HTTP soportados. */
export type MetodoHttp = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

/** Valor admitido en la cadena de consulta. */
export type ValorConsulta = string | number | boolean | undefined | null;

/** Opciones de una petición. */
export interface OpcionesPeticion {
  /** Método HTTP (por defecto `GET`). */
  metodo?: MetodoHttp;
  /** Cuerpo enviado como JSON. */
  cuerpo?: unknown;
  /** Parámetros de la cadena de consulta. */
  consulta?: Record<string, ValorConsulta>;
  /** Envía el token de acceso (por defecto `true`). */
  autenticada?: boolean;
  /** Evita el reintento tras renovar el token (uso interno). */
  sinReintento?: boolean;
}

/** Error uniforme devuelto por la API. */
export class ErrorApi extends Error {
  /** Código HTTP de la respuesta. */
  readonly estado: number;
  /** Código de negocio (`SCREAMING_SNAKE_CASE`). */
  readonly codigo: string;
  /** Detalle opcional (validaciones, conflictos). */
  readonly detalles: unknown;

  /**
   * @param estado Código HTTP (`0` si no hubo respuesta).
   * @param codigo Código de negocio.
   * @param mensaje Mensaje legible para el usuario.
   * @param detalles Detalle opcional.
   */
  constructor(estado: number, codigo: string, mensaje: string, detalles: unknown = null) {
    super(mensaje);
    this.name = 'ErrorApi';
    this.estado = estado;
    this.codigo = codigo;
    this.detalles = detalles;
  }
}

/** Respuesta con metadatos (paginación, totales). */
export interface RespuestaConMeta<T> {
  /** Datos devueltos por la API. */
  datos: T;
  /** Metadatos de la respuesta. */
  meta: Record<string, unknown>;
}

/** Sobre uniforme de respuesta del backend. */
interface SobreRespuesta<T> {
  ok: boolean;
  datos?: T;
  meta?: Record<string, unknown>;
  error?: { codigo?: string; mensaje?: string; detalles?: unknown };
}

/** Tokens en memoria (evita leer el almacenamiento en cada petición). */
let tokenAcceso: string | null = null;
let tokenRefresco: string | null = null;
let alPerderSesion: (() => void) | null = null;
let refrescoEnCurso: Promise<boolean> | null = null;

/**
 * Registra el callback que se invoca cuando la sesión deja de ser válida.
 * @param callback Función a llamar (o `null` para desregistrar).
 */
export function registrarPerdidaSesion(callback: (() => void) | null): void {
  alPerderSesion = callback;
}

/**
 * Fija los tokens en memoria.
 * @param acceso Token de acceso (o `null`).
 * @param refresco Token de refresco; si se omite, se conserva el actual.
 */
export function fijarTokens(acceso: string | null, refresco?: string | null): void {
  tokenAcceso = acceso;
  if (refresco !== undefined) tokenRefresco = refresco;
}

/** Devuelve una copia de los tokens en memoria. */
export function tokensEnMemoria(): { acceso: string | null; refresco: string | null } {
  return { acceso: tokenAcceso, refresco: tokenRefresco };
}

/** Carga en memoria los tokens persistidos. */
export async function cargarTokensGuardados(): Promise<void> {
  tokenAcceso = await obtener(CLAVES.accessToken);
  tokenRefresco = await obtener(CLAVES.refreshToken);
}

/** Elimina los tokens de memoria y del almacenamiento persistente. */
export async function limpiarTokens(): Promise<void> {
  tokenAcceso = null;
  tokenRefresco = null;
  await eliminar(CLAVES.accessToken);
  await eliminar(CLAVES.refreshToken);
  await eliminar(CLAVES.usuario);
}

/**
 * Arma la URL final con la cadena de consulta.
 * @param ruta Ruta relativa al prefijo de la API.
 * @param consulta Parámetros opcionales.
 */
function construirUrl(ruta: string, consulta?: Record<string, ValorConsulta>): string {
  const base = `${URL_API}${ruta.startsWith('/') ? ruta : `/${ruta}`}`;
  if (!consulta) return base;
  const partes: string[] = [];
  for (const [clave, valor] of Object.entries(consulta)) {
    if (valor === undefined || valor === null || valor === '') continue;
    partes.push(`${encodeURIComponent(clave)}=${encodeURIComponent(String(valor))}`);
  }
  return partes.length ? `${base}${base.includes('?') ? '&' : '?'}${partes.join('&')}` : base;
}

/**
 * Prueba en paralelo las URLs candidatas de la API y actualiza `URL_API` con la primera que responda.
 */
export async function descubrirUrlDisponible(incluirActual = false): Promise<string | null> {
  const candidatas = obtenerUrlsCandidatas().filter((u) => incluirActual || u !== URL_API);
  if (!candidatas.length) return URL_API;

  const probarUna = async (base: string): Promise<string> => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000);
    try {
      const resp = await fetch(`${base}/health`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: ctrl.signal
      });
      if (resp.ok) return base;
      throw new Error('No disponible');
    } finally {
      clearTimeout(timer);
    }
  };

  try {
    const ganadora = await Promise.any(candidatas.map((base) => probarUna(base)));
    URL_API = ganadora;
    return ganadora;
  } catch {
    return null;
  }
}

// Autodescubrir el servidor activo apenas inicia la app en segundo plano.
void descubrirUrlDisponible(true);

/**
 * Ejecuta el fetch con tiempo límite y traduce los fallos de red.
 * Si la URL activa no responde, autodescubre otra IP disponible del backend y reintenta.
 * @param url URL absoluta.
 * @param metodo Método HTTP.
 * @param cabeceras Cabeceras de la petición.
 * @param cuerpo Cuerpo serializable o `undefined`.
 */
async function enviar(
  url: string,
  metodo: MetodoHttp,
  cabeceras: Record<string, string>,
  cuerpo: unknown
): Promise<Response> {
  const ejecutarFetch = async (urlDestino: string, limiteMs: number): Promise<Response> => {
    const controlador = new AbortController();
    const temporizador = setTimeout(() => controlador.abort(), limiteMs);
    try {
      return await fetch(urlDestino, {
        method: metodo,
        headers: cabeceras,
        body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
        signal: controlador.signal
      });
    } finally {
      clearTimeout(temporizador);
    }
  };

  try {
    return await ejecutarFetch(url, Math.min(TIEMPO_LIMITE, 6000));
  } catch (errorInicial) {
    const urlAnterior = URL_API;
    const nuevaBase = await descubrirUrlDisponible();
    if (nuevaBase && url.startsWith(urlAnterior)) {
      const urlReintento = `${nuevaBase}${url.slice(urlAnterior.length)}`;
      try {
        return await ejecutarFetch(urlReintento, TIEMPO_LIMITE);
      } catch (errorReintento) {
        if (errorReintento instanceof Error && errorReintento.name === 'AbortError') {
          throw new ErrorApi(
            0,
            'TIEMPO_AGOTADO',
            'La conexión tardó demasiado. Revisá tu red e intentá nuevamente.'
          );
        }
      }
    }
    if (errorInicial instanceof Error && errorInicial.name === 'AbortError') {
      throw new ErrorApi(
        0,
        'TIEMPO_AGOTADO',
        'La conexión tardó demasiado. Revisá tu red e intentá nuevamente.'
      );
    }
    throw new ErrorApi(
      0,
      'SIN_CONEXION',
      'No se pudo conectar con el servidor. Verificá que el backend esté disponible.'
    );
  }
}

/**
 * Interpreta la respuesta del backend y lanza {@link ErrorApi} si falló.
 * @param respuesta Respuesta cruda del fetch.
 */
async function interpretar<T>(respuesta: Response): Promise<RespuestaConMeta<T>> {
  let sobre: SobreRespuesta<T> | null = null;
  try {
    sobre = (await respuesta.json()) as SobreRespuesta<T>;
  } catch {
    sobre = null;
  }

  if (!respuesta.ok || sobre?.ok === false) {
    const error = sobre?.error ?? {};
    throw new ErrorApi(
      respuesta.status,
      error.codigo ?? 'ERROR_DESCONOCIDO',
      error.mensaje ?? `La operación falló (${respuesta.status}).`,
      error.detalles ?? null
    );
  }

  return { datos: sobre?.datos as T, meta: sobre?.meta ?? {} };
}

/** Intenta renovar la sesión con el refresh token. */
async function renovarSesion(): Promise<boolean> {
  if (refrescoEnCurso) return refrescoEnCurso;
  if (!tokenRefresco) return false;

  refrescoEnCurso = (async () => {
    try {
      const respuesta = await enviar(
        construirUrl('/auth/refrescar'),
        'POST',
        { 'Content-Type': 'application/json', Accept: 'application/json' },
        { refreshToken: tokenRefresco }
      );
      const { datos } = await interpretar<{ accessToken: string; refreshToken: string }>(respuesta);
      tokenAcceso = datos.accessToken;
      tokenRefresco = datos.refreshToken;
      await guardar(CLAVES.accessToken, datos.accessToken);
      await guardar(CLAVES.refreshToken, datos.refreshToken);
      return true;
    } catch {
      return false;
    } finally {
      refrescoEnCurso = null;
    }
  })();

  return refrescoEnCurso;
}

/**
 * Realiza una petición autenticada a la API.
 * @param ruta Ruta relativa (por ejemplo `/productos`).
 * @param opciones Opciones de la petición.
 * @returns Los `datos` de la respuesta.
 */
export async function peticion<T>(ruta: string, opciones: OpcionesPeticion = {}): Promise<T> {
  const { datos } = await peticionConMeta<T>(ruta, opciones);
  return datos;
}

/**
 * Realiza una petición y devuelve también los metadatos (paginación).
 * @param ruta Ruta relativa (por ejemplo `/productos`).
 * @param opciones Opciones de la petición.
 */
export async function peticionConMeta<T>(
  ruta: string,
  opciones: OpcionesPeticion = {}
): Promise<RespuestaConMeta<T>> {
  const { metodo = 'GET', cuerpo, consulta, autenticada = true, sinReintento = false } = opciones;
  const url = construirUrl(ruta, consulta);

  const cabeceras: Record<string, string> = { Accept: 'application/json' };
  if (cuerpo !== undefined) cabeceras['Content-Type'] = 'application/json';
  if (autenticada && tokenAcceso) cabeceras.Authorization = `Bearer ${tokenAcceso}`;

  let respuesta = await enviar(url, metodo, cabeceras, cuerpo);

  if (respuesta.status === 401 && autenticada && !sinReintento) {
    const renovada = await renovarSesion();
    if (renovada) {
      const cabecerasReintento = { ...cabeceras };
      if (tokenAcceso) cabecerasReintento.Authorization = `Bearer ${tokenAcceso}`;
      respuesta = await enviar(url, metodo, cabecerasReintento, cuerpo);
    } else {
      await limpiarTokens();
      alPerderSesion?.();
    }
  }

  return interpretar<T>(respuesta);
}

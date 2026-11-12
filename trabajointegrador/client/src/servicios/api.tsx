/**
 * @file Cliente HTTP de la API. Centraliza la URL base, la cabecera de
 *       autorización, el manejo uniforme de errores, la renovación
 *       automática de la sesión con el refresh token y el motor de
 *       sincronización en tiempo real entre dispositivos (celular ↔ PC).
 * @module client/src/servicios/api
 */

import Constants from 'expo-constants';

import { CLAVES, eliminar, guardar, obtener } from './almacenamiento';

const URL_RENDER = 'https://stocker-aqs2.onrender.com/api/v1';

/**
 * Determina la URL base inicial de la API.
 */
function resolverUrlApi(): string {
  const configurada = process.env.EXPO_PUBLIC_API_URL;
  if (configurada && !/^https?:\/\/(localhost|127\.0\.0\.1|10\.|192\.168\.|172\.)/.test(configurada)) {
    return configurada.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined' && window.location?.hostname === 'localhost') {
    return 'http://localhost:4000/api/v1';
  }
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    if (host) {
      return `http://${host}:4000/api/v1`;
    }
  }
  return URL_RENDER;
}

/** Lista de URLs candidatas para autodescubrimiento cuando cambia la red Wi-Fi o se usa 4G/Render. */
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
  agregar(URL_RENDER);
  agregar(process.env.EXPO_PUBLIC_API_URL);
  agregar('http://10.0.11.139:4000/api/v1');
  agregar('http://192.168.100.142:4000/api/v1');
  agregar('http://10.0.2.2:4000/api/v1');
  agregar('http://localhost:4000/api/v1');
  return lista;
}

/** URL base activa de la API (se actualiza automáticamente si otra URL responde). */
export let URL_API: string = resolverUrlApi();

/** Tiempo máximo (ms) de espera por respuesta estándar. */
const TIEMPO_LIMITE = Number(process.env.EXPO_PUBLIC_API_TIMEOUT ?? 35000);

/** Tiempo máximo (ms) para operaciones pesadas como previsualizar/importar Excel o exportar reportes. */
const TIEMPO_LIMITE_PESADO = 90000;

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

// ---------------------------------------------------------------------------
//  Motor de Sincronización en Vivo (Celular ↔ Computadora en tiempo real)
// ---------------------------------------------------------------------------
type ListenerCambioEnVivo = () => void;
const suscriptoresCambios = new Set<ListenerCambioEnVivo>();
let ultimaFirmaConocida: string | null = null;
let pollingSincronizacionIniciado = false;
let verificandoSincronizacion = false;

/**
 * Suscribe una pantalla o componente para actualizarse automáticamente en vivo
 * cuando cualquier dispositivo (celular o computadora) realiza una modificación.
 */
export function suscribirCambiosEnVivo(listener: ListenerCambioEnVivo): () => void {
  suscriptoresCambios.add(listener);
  iniciarMotorSincronizacion();
  return () => {
    suscriptoresCambios.delete(listener);
  };
}

/** Dispara todos los listeners registrados en este dispositivo. */
function emitirCambioEnVivo(): void {
  for (const listener of Array.from(suscriptoresCambios)) {
    try {
      listener();
    } catch {
      /* ignorar errores de un suscriptor individual */
    }
  }
}

/** Consulta la firma de estado en el servidor para detectar cambios de otros dispositivos. */
export async function verificarCambiosRemotos(): Promise<void> {
  if (verificandoSincronizacion || suscriptoresCambios.size === 0) return;
  verificandoSincronizacion = true;
  try {
    const resp = await Promise.race([
      fetch(`${URL_API}/sincronizacion`, {
        method: 'GET',
        headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' }
      }),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000))
    ]);

    if (resp && resp.ok) {
      const json = (await resp.json()) as SobreRespuesta<{ firma: string; timestamp: number }>;
      const nuevaFirma = json?.datos?.firma;
      if (nuevaFirma) {
        if (ultimaFirmaConocida !== null && ultimaFirmaConocida !== nuevaFirma) {
          ultimaFirmaConocida = nuevaFirma;
          emitirCambioEnVivo();
        } else if (ultimaFirmaConocida === null) {
          ultimaFirmaConocida = nuevaFirma;
        }
      }
    }
  } catch {
    /* silencioso ante microcortes */
  } finally {
    verificandoSincronizacion = false;
  }
}

function iniciarMotorSincronizacion(): void {
  if (pollingSincronizacionIniciado) return;
  pollingSincronizacionIniciado = true;

  setInterval(() => {
    void verificarCambiosRemotos();
  }, 2500);

  if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
    window.addEventListener('focus', () => {
      void verificarCambiosRemotos();
    });
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          void verificarCambiosRemotos();
        }
      });
    }
  }
}

// ---------------------------------------------------------------------------
//  Gestión de Tokens y Sesión
// ---------------------------------------------------------------------------

export function registrarPerdidaSesion(callback: (() => void) | null): void {
  alPerderSesion = callback;
}

export function fijarTokens(acceso: string | null, refresco?: string | null): void {
  tokenAcceso = acceso;
  if (refresco !== undefined) tokenRefresco = refresco;
}

export function tokensEnMemoria(): { acceso: string | null; refresco: string | null } {
  return { acceso: tokenAcceso, refresco: tokenRefresco };
}

export async function cargarTokensGuardados(): Promise<void> {
  tokenAcceso = await obtener(CLAVES.accessToken);
  tokenRefresco = await obtener(CLAVES.refreshToken);
}

export async function limpiarTokens(): Promise<void> {
  tokenAcceso = null;
  tokenRefresco = null;
  await eliminar(CLAVES.accessToken);
  await eliminar(CLAVES.refreshToken);
  await eliminar(CLAVES.usuario);
}

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
 * Prueba las URLs candidatas de la API y actualiza `URL_API` con la primera que responda.
 */
export async function descubrirUrlDisponible(incluirActual = true): Promise<string | null> {
  const candidatas = obtenerUrlsCandidatas().filter((u) => incluirActual || u !== URL_API);
  if (!candidatas.length) return URL_API;

  const probarUna = async (base: string): Promise<boolean> => {
    const esRender = base.includes('onrender.com');
    const timeoutMs = esRender ? 7000 : 2200;
    try {
      const resp = await Promise.race([
        fetch(`${base}/health`, {
          method: 'GET',
          headers: { Accept: 'application/json' }
        }),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs))
      ]);
      return Boolean(resp && resp.ok);
    } catch {
      return false;
    }
  };

  for (const base of candidatas) {
    if (await probarUna(base)) {
      URL_API = base;
      return base;
    }
  }

  // Si ninguna respondió rápido, usar Render como respaldo garantizado en la nube
  URL_API = URL_RENDER;
  return URL_RENDER;
}

// Autodescubrir el servidor activo apenas inicia la app en segundo plano.
void descubrirUrlDisponible(true);

/**
 * Ejecuta el fetch con tiempo límite adecuado según la operación (hasta 90s para importación Excel)
 * y reintenta contra Render o la URL descubierta si falla la conexión inicial.
 */
async function enviar(
  url: string,
  metodo: MetodoHttp,
  cabeceras: Record<string, string>,
  cuerpo: unknown
): Promise<Response> {
  const esRutaPesada =
    url.includes('/importacion') || url.includes('/reportes') || url.includes('/recuperar');
  const limiteEfectivo = esRutaPesada ? TIEMPO_LIMITE_PESADO : TIEMPO_LIMITE;

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
    return await ejecutarFetch(url, limiteEfectivo);
  } catch (errorInicial) {
    const urlAnterior = URL_API;
    const nuevaBase = await descubrirUrlDisponible(true);
    const basesReintento: string[] = [];
    if (nuevaBase) basesReintento.push(nuevaBase);
    if (!basesReintento.includes(URL_RENDER)) basesReintento.push(URL_RENDER);

    for (const baseCandidata of basesReintento) {
      const sufijo = url.startsWith(urlAnterior)
        ? url.slice(urlAnterior.length)
        : url.replace(/^https?:\/\/[^/]+\/api\/v1/, '');
      const urlReintento = `${baseCandidata}${sufijo.startsWith('/') ? sufijo : `/${sufijo}`}`;
      try {
        const resp = await ejecutarFetch(urlReintento, limiteEfectivo);
        URL_API = baseCandidata;
        return resp;
      } catch {
        /* intentar siguiente base candidata */
      }
    }

    if (errorInicial instanceof Error && errorInicial.name === 'AbortError') {
      throw new ErrorApi(
        0,
        'TIEMPO_AGOTADO',
        'La operación tardó más de lo esperado. Intentá nuevamente en unos segundos.'
      );
    }
    throw new ErrorApi(
      0,
      'SIN_CONEXION',
      'No se pudo conectar con el servidor. Revisá tu conexión a internet e intentá nuevamente.'
    );
  }
}

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

export async function peticion<T>(ruta: string, opciones: OpcionesPeticion = {}): Promise<T> {
  const { datos } = await peticionConMeta<T>(ruta, opciones);
  return datos;
}

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

  const resultado = await interpretar<T>(respuesta);

  // Si fue una mutación exitosa, actualizar la firma y notificar en vivo
  if (metodo !== 'GET') {
    setTimeout(() => {
      void verificarCambiosRemotos();
      emitirCambioEnVivo();
    }, 150);
  }

  return resultado;
}

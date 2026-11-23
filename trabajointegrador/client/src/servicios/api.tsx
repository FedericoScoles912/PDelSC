/**
 * @file Cliente HTTP de la API. Centraliza la URL base, la gestión de
 *       Servidores Únicos por Negocio ("Negocio 1", "Negocio 2", etc.),
 *       la cabecera de autorización, la renovación automática con refresh token
 *       y el motor de sincronización en vivo optimizado contra rate-limits.
 * @module client/src/servicios/api
 */

import Constants from 'expo-constants';
import { useEffect, useState } from 'react';
import { AppState, NativeModules } from 'react-native';

import { CLAVES, eliminar, guardar, obtener } from './almacenamiento';

const URL_RENDER = 'https://stocker-aqs2.onrender.com/api/v1';

// ---------------------------------------------------------------------------
//  Servidores Únicos por Negocio (Multi-Servidor / Multi-Negocio)
// ---------------------------------------------------------------------------

export interface ServidorNegocio {
  /** Identificador único del servidor de negocio (ej: 'negocio_1', 'negocio_2'). */
  id: string;
  /** Nombre visible del negocio (ej: 'Negocio 1', 'Negocio 2'). */
  nombre: string;
  /** Código Único (ID) del servidor (ej: 'SRV-NEGOCIO-01'). */
  codigoServidor: string;
  /** URL dedicada propia del servidor (vacío = autodetección LAN / Nube con nodo aislado). */
  urlServidor: string;
  /** Descripción opcional de la sucursal o empresa. */
  descripcion: string;
}

const SERVIDOR_NO_VINCULADO: ServidorNegocio = {
  id: 'sin_servidor',
  nombre: 'Sin servidor vinculado',
  codigoServidor: '',
  urlServidor: '',
  descripcion: 'Ingresá el Código Único (ID) y la contraseña de tu servidor para conectarte.'
};

/**
 * Credenciales iniciales de respaldo (ocultas en la interfaz; nunca se listan,
 * solo se validan si el usuario escribe exactamente el Código Único y su Contraseña).
 */
const CREDENCIALES_SERVIDORES_OCULTOS: Array<{
  codigoServidor: string;
  aliases: string[];
  password: string;
  servidor: ServidorNegocio;
}> = [
  {
    codigoServidor: 'SRV-NEGOCIO-01',
    aliases: ['SRV-NEGOCIO-01', 'NEGOCIO-01', 'NEGOCIO-1', 'NEGOCIO_1', 'NEGOCIO1'],
    password: 'negocio123',
    servidor: {
      id: 'negocio_1',
      nombre: 'Negocio 1',
      codigoServidor: 'SRV-NEGOCIO-01',
      urlServidor: '',
      descripcion: 'Servidor dedicado de gestión para Negocio 1'
    }
  },
  {
    codigoServidor: 'SRV-NEGOCIO-02',
    aliases: ['SRV-NEGOCIO-02', 'NEGOCIO-02', 'NEGOCIO-2', 'NEGOCIO_2', 'NEGOCIO2'],
    password: 'negocio234',
    servidor: {
      id: 'negocio_2',
      nombre: 'Negocio 2',
      codigoServidor: 'SRV-NEGOCIO-02',
      urlServidor: '',
      descripcion: 'Servidor dedicado de gestión independiente para Negocio 2'
    }
  }
];

// La aplicación inicia sin ningún negocio registrado y con todos los servidores ocultos.
let listaServidores: ServidorNegocio[] = [];
let servidorActivoId: string | null = null;
let servidoresCargados = false;

type ListenerServidor = (
  activo: ServidorNegocio,
  todos: ServidorNegocio[],
  vinculado: boolean
) => void;
const suscriptoresServidor = new Set<ListenerServidor>();

function notificarCambioServidor(): void {
  const activo = obtenerServidorActivo();
  const vinculado = tieneServidorNegocioVinculado();
  for (const fn of Array.from(suscriptoresServidor)) {
    try {
      fn(activo, [...listaServidores], vinculado);
    } catch {
      /* ignorar */
    }
  }
}

export function tieneServidorNegocioVinculado(): boolean {
  return Boolean(
    servidorActivoId &&
      servidorActivoId !== 'sin_servidor' &&
      listaServidores.some((s) => s.id === servidorActivoId)
  );
}

export function obtenerServidoresNegocio(): ServidorNegocio[] {
  return [...listaServidores];
}

export function obtenerServidorActivo(): ServidorNegocio {
  if (!servidorActivoId) return SERVIDOR_NO_VINCULADO;
  return listaServidores.find((s) => s.id === servidorActivoId) ?? SERVIDOR_NO_VINCULADO;
}

export function suscribirServidorNegocio(listener: ListenerServidor): () => void {
  suscriptoresServidor.add(listener);
  listener(obtenerServidorActivo(), [...listaServidores], tieneServidorNegocioVinculado());
  return () => {
    suscriptoresServidor.delete(listener);
  };
}

export function useServidorNegocio(): {
  servidorActivo: ServidorNegocio;
  servidores: ServidorNegocio[];
  tieneServidorVinculado: boolean;
} {
  const [estado, setEstado] = useState<{
    servidorActivo: ServidorNegocio;
    servidores: ServidorNegocio[];
    tieneServidorVinculado: boolean;
  }>(() => ({
    servidorActivo: obtenerServidorActivo(),
    servidores: obtenerServidoresNegocio(),
    tieneServidorVinculado: tieneServidorNegocioVinculado()
  }));

  useEffect(() => {
    return suscribirServidorNegocio((activo, todos, vinculado) => {
      setEstado({
        servidorActivo: activo,
        servidores: todos,
        tieneServidorVinculado: vinculado
      });
    });
  }, []);

  return estado;
}

export async function cargarServidoresNegocio(): Promise<void> {
  if (servidoresCargados) return;
  servidoresCargados = true;
  try {
    const [crudoLista, crudoActivo] = await Promise.all([
      obtener(CLAVES.servidoresNegocio),
      obtener(CLAVES.servidorActivoId)
    ]);
    if (crudoLista) {
      const parseada = JSON.parse(crudoLista) as ServidorNegocio[];
      if (Array.isArray(parseada)) {
        listaServidores = parseada;
      }
    }
    if (crudoActivo && listaServidores.some((s) => s.id === crudoActivo)) {
      servidorActivoId = crudoActivo;
    } else {
      servidorActivoId = null;
    }
    const activo = obtenerServidorActivo();
    if (activo.urlServidor) {
      URL_API = normalizarUrlApi(activo.urlServidor);
    }
    notificarCambioServidor();
  } catch {
    listaServidores = [];
    servidorActivoId = null;
  }
}

void cargarServidoresNegocio();

export function normalizarUrlApi(bruta: string): string {
  const limpia = bruta.trim().replace(/\/+$/, '');
  if (!limpia) return resolverUrlApi();
  if (limpia.endsWith('/api/v1')) return limpia;
  if (limpia.endsWith('/api')) return `${limpia}/v1`;
  return `${limpia}/api/v1`;
}

/**
 * Activa un servidor previamente desbloqueado con su Código Único (ID) y contraseña.
 */
export async function seleccionarServidorNegocio(id: string): Promise<ServidorNegocio> {
  const destino = listaServidores.find((s) => s.id === id);
  if (!destino) return obtenerServidorActivo();

  servidorActivoId = destino.id;
  ultimaFirmaConocida = null;

  if (destino.urlServidor.trim()) {
    URL_API = normalizarUrlApi(destino.urlServidor);
  } else {
    await descubrirUrlDisponible(true);
  }

  await guardar(CLAVES.servidorActivoId, destino.id);
  notificarCambioServidor();
  emitirCambioEnVivo();
  void verificarCambiosRemotos(true);
  return destino;
}

/**
 * Desvincula el servidor actual de este dispositivo, volviendo al estado inicial
 * sin ningún negocio registrado (todos los servidores quedan ocultos hasta volver
 * a ingresar Código Único y Contraseña).
 */
export async function desconectarServidorNegocioActual(): Promise<void> {
  if (!servidorActivoId) return;
  const idActual = servidorActivoId;
  listaServidores = listaServidores.filter((s) => s.id !== idActual);
  servidorActivoId = listaServidores[0]?.id ?? null;
  ultimaFirmaConocida = null;

  await guardar(CLAVES.servidoresNegocio, JSON.stringify(listaServidores));
  if (servidorActivoId) {
    await guardar(CLAVES.servidorActivoId, servidorActivoId);
  } else {
    await eliminar(CLAVES.servidorActivoId);
  }
  notificarCambioServidor();
  emitirCambioEnVivo();
}

async function registrarServidorDesbloqueadoLocal(srv: ServidorNegocio): Promise<ServidorNegocio> {
  const existenteIdx = listaServidores.findIndex((s) => s.id === srv.id);
  if (existenteIdx >= 0) {
    listaServidores = listaServidores.map((s, i) => (i === existenteIdx ? srv : s));
  } else {
    listaServidores = [...listaServidores, srv];
  }
  await guardar(CLAVES.servidoresNegocio, JSON.stringify(listaServidores));
  return seleccionarServidorNegocio(srv.id);
}

/**
 * Autentica y desbloquea un servidor oculto mediante su Código Único (ID) y su Contraseña.
 */
export async function autenticarServidorConCredenciales(entrada: {
  codigoServidor: string;
  password: string;
  urlServidor?: string;
}): Promise<ServidorNegocio> {
  const codigoLimpio = entrada.codigoServidor
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '-');
  const clave = entrada.password;
  const urlPersonalizada = (entrada.urlServidor ?? '').trim();

  if (!codigoLimpio) {
    throw new Error('Ingresá el Código Único (ID) del servidor.');
  }
  if (!clave) {
    throw new Error('Ingresá la contraseña del servidor.');
  }

  if (urlPersonalizada) {
    URL_API = normalizarUrlApi(urlPersonalizada);
  } else {
    await descubrirUrlDisponible(true);
  }

  // 1) Intentar validación contra el endpoint del backend /servidores/acceder
  try {
    const resp = await fetchConTimeout(
      `${URL_API}/servidores/acceder`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          codigoServidor: codigoLimpio,
          password: clave
        })
      },
      4500
    );

    if (resp) {
      if (resp.status === 401 || resp.status === 403) {
        const errJson = (await resp.json().catch(() => null)) as SobreRespuesta<unknown> | null;
        throw new Error(
          errJson?.error?.mensaje ||
            'Código Único (ID) o contraseña del servidor incorrectos.'
        );
      }
      if (resp.ok) {
        const json = (await resp.json()) as SobreRespuesta<ServidorNegocio>;
        if (json?.datos) {
          const desbloqueado: ServidorNegocio = {
            ...json.datos,
            urlServidor: urlPersonalizada || json.datos.urlServidor || ''
          };
          return registrarServidorDesbloqueadoLocal(desbloqueado);
        }
      }
    }
  } catch (err) {
    if (err instanceof Error && err.message.includes('incorrectos')) {
      throw err;
    }
    /* Si el servidor remoto es una versión previa sin /servidores/acceder, validar contra credenciales cifradas */
  }

  // 2) Respaldo de validación estricta por Código Único (ID) + Contraseña
  const coincidencia = CREDENCIALES_SERVIDORES_OCULTOS.find(
    (c) => c.aliases.includes(codigoLimpio) && c.password === clave
  );
  if (!coincidencia) {
    throw new Error(
      'Código Único (ID) o contraseña del servidor inválidos. Verificá las credenciales de tu negocio.'
    );
  }

  return registrarServidorDesbloqueadoLocal({
    ...coincidencia.servidor,
    urlServidor: urlPersonalizada
  });
}

/**
 * Crea un nuevo servidor único de negocio protegido por Código Único (ID) y Contraseña.
 */
export async function registrarNuevoServidorConCredenciales(entrada: {
  nombre: string;
  codigoServidor: string;
  password: string;
  urlServidor?: string;
  descripcion?: string;
}): Promise<ServidorNegocio> {
  const nombreLimpio = entrada.nombre.trim();
  const codigoLimpio = entrada.codigoServidor
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '-')
    .replace(/[^A-Z0-9_-]/g, '');
  const clave = entrada.password;
  const urlPersonalizada = (entrada.urlServidor ?? '').trim();

  if (!nombreLimpio) {
    throw new Error('Ingresá el nombre del negocio.');
  }
  if (!codigoLimpio || codigoLimpio.length < 3) {
    throw new Error('El Código Único (ID) del servidor debe tener al menos 3 caracteres.');
  }
  if (!clave || clave.length < 4) {
    throw new Error('La contraseña del servidor debe tener al menos 4 caracteres.');
  }

  if (urlPersonalizada) {
    URL_API = normalizarUrlApi(urlPersonalizada);
  } else {
    await descubrirUrlDisponible(true);
  }

  try {
    const resp = await fetchConTimeout(
      `${URL_API}/servidores/registrar`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nombre: nombreLimpio,
          codigoServidor: codigoLimpio,
          password: clave,
          urlServidor: urlPersonalizada,
          descripcion: entrada.descripcion?.trim() || ''
        })
      },
      5000
    );

    if (resp) {
      if (resp.status === 409 || resp.status === 400) {
        const errJson = (await resp.json().catch(() => null)) as SobreRespuesta<unknown> | null;
        throw new Error(
          errJson?.error?.mensaje || 'No se pudo registrar el servidor con ese Código Único.'
        );
      }
      if (resp.ok) {
        const json = (await resp.json()) as SobreRespuesta<ServidorNegocio>;
        if (json?.datos) {
          return registrarServidorDesbloqueadoLocal({
            ...json.datos,
            urlServidor: urlPersonalizada || json.datos.urlServidor || ''
          });
        }
      }
    }
  } catch (err) {
    if (err instanceof Error && (err.message.includes('Ya existe') || err.message.includes('No se pudo'))) {
      throw err;
    }
  }

  const idNormalizado =
    codigoLimpio
      .toLowerCase()
      .replace(/^srv[-_]?/, '')
      .replace(/[^a-z0-9_]/g, '_')
      .slice(0, 24) || `negocio_${Date.now()}`;

  const nuevo: ServidorNegocio = {
    id: idNormalizado,
    nombre: nombreLimpio,
    codigoServidor: codigoLimpio,
    urlServidor: urlPersonalizada,
    descripcion:
      (entrada.descripcion ?? '').trim() || `Servidor dedicado exclusivo para ${nombreLimpio}`
  };

  CREDENCIALES_SERVIDORES_OCULTOS.push({
    codigoServidor: codigoLimpio,
    aliases: [codigoLimpio, idNormalizado.toUpperCase()],
    password: clave,
    servidor: nuevo
  });

  return registrarServidorDesbloqueadoLocal(nuevo);
}

export async function eliminarServidorNegocio(id: string): Promise<void> {
  listaServidores = listaServidores.filter((s) => s.id !== id);
  await guardar(CLAVES.servidoresNegocio, JSON.stringify(listaServidores));
  if (servidorActivoId === id) {
    const primero = listaServidores[0];
    if (primero) {
      await seleccionarServidorNegocio(primero.id);
    } else {
      servidorActivoId = null;
      await eliminar(CLAVES.servidorActivoId);
      notificarCambioServidor();
    }
  } else {
    notificarCambioServidor();
  }
}

// ---------------------------------------------------------------------------
//  Resolución y Autodescubrimiento de URL del Servidor
// ---------------------------------------------------------------------------

function detectarHostMetro(): string | null {
  const candidatosHost: Array<string | undefined | null> = [
    Constants.expoConfig?.hostUri,
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost,
    (Constants as any).manifest?.debuggerHost,
    (Constants as any).expoGoConfig?.debuggerHost
  ];

  const scriptURL: string | undefined = NativeModules?.SourceCode?.scriptURL;
  if (scriptURL) {
    const match = scriptURL.match(/^https?:\/\/([^/:]+)/i);
    if (match?.[1]) candidatosHost.unshift(match[1]);
  }

  for (const bruto of candidatosHost) {
    if (!bruto) continue;
    const limpio = String(bruto)
      .replace(/^https?:\/\//i, '')
      .split('/')[0]
      ?.split(':')[0]
      ?.trim();
    if (
      limpio &&
      !limpio.endsWith('.exp.direct') &&
      !limpio.endsWith('.expo.dev') &&
      limpio !== 'localhost' &&
      limpio !== '127.0.0.1'
    ) {
      return limpio;
    }
  }
  return null;
}

function resolverUrlApi(): string {
  const activo = listaServidores.find((s) => s.id === servidorActivoId);
  if (activo?.urlServidor?.trim()) {
    return normalizarUrlApi(activo.urlServidor);
  }

  if (typeof window !== 'undefined' && window.location?.hostname) {
    const webHost = window.location.hostname;
    if (
      webHost === 'localhost' ||
      webHost === '127.0.0.1' ||
      /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(webHost)
    ) {
      return `http://${webHost}:4000/api/v1`;
    }
  }

  const hostMetro = detectarHostMetro();
  if (hostMetro) {
    return `http://${hostMetro}:4000/api/v1`;
  }

  const configurada = process.env.EXPO_PUBLIC_API_URL;
  if (configurada) {
    return configurada.replace(/\/+$/, '');
  }

  return 'http://192.168.0.221:4000/api/v1';
}

function obtenerUrlsCandidatas(): string[] {
  const activo = obtenerServidorActivo();
  if (activo.urlServidor.trim()) {
    return [normalizarUrlApi(activo.urlServidor)];
  }

  const lista: string[] = [];
  const agregar = (u?: string | null) => {
    if (!u) return;
    const limpia = u.replace(/\/+$/, '');
    if (!lista.includes(limpia)) lista.push(limpia);
  };

  if (typeof window !== 'undefined' && window.location?.hostname) {
    agregar(`http://${window.location.hostname}:4000/api/v1`);
  }
  const hostMetro = detectarHostMetro();
  if (hostMetro) {
    agregar(`http://${hostMetro}:4000/api/v1`);
  }
  agregar('http://192.168.0.221:4000/api/v1');
  agregar('http://10.0.11.139:4000/api/v1');
  agregar(process.env.EXPO_PUBLIC_API_URL);
  agregar('http://192.168.100.142:4000/api/v1');
  agregar('http://10.0.2.2:4000/api/v1');
  agregar('http://localhost:4000/api/v1');
  agregar(URL_RENDER);
  return lista;
}

export let URL_API: string = resolverUrlApi();

const TIEMPO_LIMITE = Number(process.env.EXPO_PUBLIC_API_TIMEOUT ?? 35000);
const TIEMPO_LIMITE_PESADO = 90000;

export type MetodoHttp = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
export type ValorConsulta = string | number | boolean | undefined | null;

export interface OpcionesPeticion {
  metodo?: MetodoHttp;
  cuerpo?: unknown;
  consulta?: Record<string, ValorConsulta>;
  autenticada?: boolean;
  sinReintento?: boolean;
}

export class ErrorApi extends Error {
  readonly estado: number;
  readonly codigo: string;
  readonly detalles: unknown;

  constructor(estado: number, codigo: string, mensaje: string, detalles: unknown = null) {
    super(mensaje);
    this.name = 'ErrorApi';
    this.estado = estado;
    this.codigo = codigo;
    this.detalles = detalles;
  }
}

export interface RespuestaConMeta<T> {
  datos: T;
  meta: Record<string, unknown>;
}

interface SobreRespuesta<T> {
  ok: boolean;
  datos?: T;
  meta?: Record<string, unknown>;
  error?: { codigo?: string; mensaje?: string; detalles?: unknown };
}

let tokenAcceso: string | null = null;
let tokenRefresco: string | null = null;
let alPerderSesion: (() => void) | null = null;
let refrescoEnCurso: Promise<boolean> | null = null;

// ---------------------------------------------------------------------------
//  Motor de Sincronización en Vivo (Optimizado contra Rate Limiting)
// ---------------------------------------------------------------------------
type ListenerCambioEnVivo = () => void;
const suscriptoresCambios = new Set<ListenerCambioEnVivo>();
let ultimaFirmaConocida: string | null = null;
let pollingSincronizacionIniciado = false;
let verificandoSincronizacion = false;
let pausaPorRateLimitHasta = 0;
const hostsSinEndpointSinc = new Set<string>();

export function suscribirCambiosEnVivo(listener: ListenerCambioEnVivo): () => void {
  suscriptoresCambios.add(listener);
  iniciarMotorSincronizacion();
  return () => {
    suscriptoresCambios.delete(listener);
  };
}

function emitirCambioEnVivo(): void {
  for (const listener of Array.from(suscriptoresCambios)) {
    try {
      listener();
    } catch {
      /* ignorar errores de un suscriptor individual */
    }
  }
}

export function emitirRecargaGlobalEnVivo(): void {
  emitirCambioEnVivo();
}

async function fetchConTimeout(
  url: string,
  opciones: RequestInit,
  timeoutMs: number
): Promise<Response | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { ...opciones, signal: ctrl.signal });
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

let ultimoSondeoLanMs = 0;

function cabecerasNegocioBase(): Record<string, string> {
  const srv = obtenerServidorActivo();
  return {
    Accept: 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    Pragma: 'no-cache',
    'X-Servidor-Negocio': srv.id
  };
}

async function obtenerFirmaEstadoRemoto(): Promise<string | null> {
  const ahora = Date.now();
  if (ahora < pausaPorRateLimitHasta) return null;

  const srv = obtenerServidorActivo();
  if (!tieneServidorNegocioVinculado() || srv.id === 'sin_servidor') return null;
  const cabecerasBase = cabecerasNegocioBase();

  // 1) Intentar endpoint liviano /sincronizacion en la URL activa (salvo que haya devuelto 401/404 antes)
  if (!hostsSinEndpointSinc.has(URL_API)) {
    const respDirecta = await fetchConTimeout(
      `${URL_API}/sincronizacion?_negocio=${encodeURIComponent(srv.id)}&_t=${ahora}`,
      { method: 'GET', headers: cabecerasBase },
      2500
    );

    if (respDirecta) {
      if (respDirecta.status === 429) {
        pausaPorRateLimitHasta = ahora + 20000;
        return null;
      }
      if (respDirecta.status === 401 || respDirecta.status === 404) {
        hostsSinEndpointSinc.add(URL_API);
      } else if (respDirecta.ok) {
        const json = (await respDirecta.json()) as SobreRespuesta<{ firma: string }>;
        if (json?.datos?.firma) return `${srv.id}:${json.datos.firma}`;
      }
    }
  }

  // 2) Sondear servidores LAN locales (máx cada 18s si no hay URL fija personalizada)
  if (!srv.urlServidor.trim() && ahora - ultimoSondeoLanMs > 18000) {
    ultimoSondeoLanMs = ahora;
    const candidatasLan = obtenerUrlsCandidatas().filter(
      (u) => !u.includes('onrender.com') && u !== URL_API
    );
    for (const baseLan of candidatasLan) {
      const respLan = await fetchConTimeout(
        `${baseLan}/sincronizacion?_negocio=${encodeURIComponent(srv.id)}&_t=${ahora}`,
        { method: 'GET', headers: cabecerasBase },
        1100
      );
      if (respLan && respLan.ok) {
        const jsonLan = (await respLan.json()) as SobreRespuesta<{ firma: string }>;
        if (jsonLan?.datos?.firma) {
          URL_API = baseLan;
          hostsSinEndpointSinc.delete(baseLan);
          return `${srv.id}:${jsonLan.datos.firma}`;
        }
      }
    }
  }

  // 3) Fallback liviano de 1 sola petición (evita saturar el rate-limit del servidor en la nube)
  if (!tokenAcceso) return null;

  const cabecerasAuth: Record<string, string> = {
    ...cabecerasBase,
    Authorization: `Bearer ${tokenAcceso}`
  };

  const rDash = await fetchConTimeout(
    `${URL_API}/dashboard/resumen?_negocio=${encodeURIComponent(srv.id)}&_t=${ahora}`,
    { method: 'GET', headers: cabecerasAuth },
    4000
  );

  if (!rDash) return null;
  if (rDash.status === 429) {
    pausaPorRateLimitHasta = ahora + 25000;
    return null;
  }
  if (!rDash.ok) return null;

  const jDash = (await rDash.json()) as SobreRespuesta<any>;
  const d = jDash?.datos;
  if (!d) return null;

  return [
    srv.id,
    `P:${d.productos?.total}:${d.productos?.activos}:${d.productos?.inactivos}`,
    `S:${d.stock?.unidadesTotales}:${d.stock?.valorTotal}:${d.stock?.bajoMinimo}:${d.stock?.sinStock}`,
    `C:${d.categorias?.total}`,
    `U:${d.usuarios?.total}:${d.usuarios?.activos}`,
    `M:${d.ultimosMovimientos?.[0]?.id ?? 0}:${d.ultimosMovimientos?.[0]?.stock_resultante ?? 0}`
  ].join('|');
}

export async function verificarCambiosRemotos(forzarNotificacion = false): Promise<void> {
  if (verificandoSincronizacion || suscriptoresCambios.size === 0) return;
  if (!forzarNotificacion && Date.now() < pausaPorRateLimitHasta) return;

  verificandoSincronizacion = true;
  try {
    const nuevaFirma = await obtenerFirmaEstadoRemoto();
    if (nuevaFirma) {
      if (forzarNotificacion) {
        ultimaFirmaConocida = nuevaFirma;
        emitirCambioEnVivo();
      } else if (ultimaFirmaConocida !== null && ultimaFirmaConocida !== nuevaFirma) {
        ultimaFirmaConocida = nuevaFirma;
        emitirCambioEnVivo();
      } else if (ultimaFirmaConocida === null) {
        ultimaFirmaConocida = nuevaFirma;
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

  // Intervalo de 3 segundos para renderización en vivo entre dispositivos sin saturar la red
  setInterval(() => {
    void verificarCambiosRemotos();
  }, 3000);

  try {
    AppState.addEventListener('change', (estadoApp) => {
      if (estadoApp === 'active') {
        void verificarCambiosRemotos();
      }
    });
  } catch {
    /* ignorar */
  }

  if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
    window.addEventListener('focus', () => {
      void verificarCambiosRemotos();
    });
  }
}

// ---------------------------------------------------------------------------
//  Gestión de Tokens y Sesión
// ---------------------------------------------------------------------------

type ListenerToken = (tieneAcceso: boolean) => void;
const suscriptoresToken = new Set<ListenerToken>();

export function suscribirCambioToken(listener: ListenerToken): () => void {
  suscriptoresToken.add(listener);
  return () => {
    suscriptoresToken.delete(listener);
  };
}

function notificarCambioToken(): void {
  const autenticado = Boolean(tokenAcceso);
  for (const fn of Array.from(suscriptoresToken)) {
    try {
      fn(autenticado);
    } catch {
      /* ignorar */
    }
  }
}

export function registrarPerdidaSesion(callback: (() => void) | null): void {
  alPerderSesion = callback;
}

export function fijarTokens(acceso: string | null, refresco?: string | null): void {
  const cambio = Boolean(tokenAcceso) !== Boolean(acceso) || tokenAcceso !== acceso;
  tokenAcceso = acceso;
  if (refresco !== undefined) tokenRefresco = refresco;
  if (cambio) notificarCambioToken();
}

export function tokensEnMemoria(): { acceso: string | null; refresco: string | null } {
  return { acceso: tokenAcceso, refresco: tokenRefresco };
}

export async function cargarTokensGuardados(): Promise<void> {
  await cargarServidoresNegocio();
  tokenAcceso = await obtener(CLAVES.accessToken);
  tokenRefresco = await obtener(CLAVES.refreshToken);
  notificarCambioToken();
}

export async function limpiarTokens(): Promise<void> {
  tokenAcceso = null;
  tokenRefresco = null;
  await eliminar(CLAVES.accessToken);
  await eliminar(CLAVES.refreshToken);
  await eliminar(CLAVES.usuario);
}

function construirUrl(ruta: string, consulta?: Record<string, ValorConsulta>): string {
  const srv = obtenerServidorActivo();
  const baseUrl = srv.urlServidor.trim() ? normalizarUrlApi(srv.urlServidor) : URL_API;
  const base = `${baseUrl}${ruta.startsWith('/') ? ruta : `/${ruta}`}`;
  const consultaConNegocio: Record<string, ValorConsulta> = {
    ...(consulta ?? {}),
    _negocio: srv.id
  };
  const partes: string[] = [];
  for (const [clave, valor] of Object.entries(consultaConNegocio)) {
    if (valor === undefined || valor === null || valor === '') continue;
    partes.push(`${encodeURIComponent(clave)}=${encodeURIComponent(String(valor))}`);
  }
  return partes.length ? `${base}${base.includes('?') ? '&' : '?'}${partes.join('&')}` : base;
}

export async function descubrirUrlDisponible(incluirActual = true): Promise<string | null> {
  const srv = obtenerServidorActivo();
  if (srv.urlServidor.trim()) {
    URL_API = normalizarUrlApi(srv.urlServidor);
    return URL_API;
  }

  const candidatas = obtenerUrlsCandidatas().filter((u) => incluirActual || u !== URL_API);
  if (!candidatas.length) return URL_API;

  const locales = candidatas.filter((u) => !u.includes('onrender.com'));
  if (locales.length > 0) {
    const resultados = await Promise.all(
      locales.map(async (base) => {
        const resp = await fetchConTimeout(
          `${base}/health?_t=${Date.now()}`,
          { method: 'GET', headers: cabecerasNegocioBase() },
          1800
        );
        return resp && resp.ok ? base : null;
      })
    );
    const mejorLocal = resultados.find(Boolean);
    if (mejorLocal) {
      URL_API = mejorLocal;
      return mejorLocal;
    }
  }

  URL_API = URL_RENDER;
  return URL_RENDER;
}

void descubrirUrlDisponible(true);

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
    const resp = await ejecutarFetch(url, limiteEfectivo);
    // Si el servidor devolvió 429 (Demasiadas solicitudes), pausar polling y reintentar 1 vez
    if (resp.status === 429) {
      pausaPorRateLimitHasta = Date.now() + 20000;
      await new Promise((r) => setTimeout(r, 1400));
      return await ejecutarFetch(url, limiteEfectivo);
    }
    return resp;
  } catch (errorInicial) {
    const srv = obtenerServidorActivo();
    if (srv.urlServidor.trim()) {
      throw new ErrorApi(
        0,
        'SIN_CONEXION',
        `No se pudo conectar con el servidor propio de ${srv.nombre} (${srv.urlServidor}). Verificá que el servidor esté encendido.`
      );
    }

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
        {
          ...cabecerasNegocioBase(),
          'Content-Type': 'application/json'
        },
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
  const consultaEfectiva =
    metodo === 'GET' ? { ...(consulta ?? {}), _t: Date.now() } : consulta;
  const url = construirUrl(ruta, consultaEfectiva);

  const cabeceras: Record<string, string> = {
    ...cabecerasNegocioBase()
  };
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

  if (metodo !== 'GET') {
    emitirCambioEnVivo();
    setTimeout(() => {
      void verificarCambiosRemotos(true);
    }, 250);
  }

  return resultado;
}

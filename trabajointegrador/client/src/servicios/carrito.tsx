/**
 * @file Servicio del Carrito de Reposición para productos en alerta de bajo stock.
 *       Sincronizado en vivo con el servidor de negocio activo (`negocio_1`, `negocio_2`,
 *       etc.) para que todos los dispositivos conectados (celular ↔ computadora) compartan
 *       y actualicen el mismo carrito en tiempo real, con respaldo local ante microcortes.
 * @module client/src/servicios/carrito
 */

import { useEffect, useState } from 'react';
import { Linking, Platform } from 'react-native';

import { CLAVES, guardar, obtener } from './almacenamiento';
import {
  obtenerServidorActivo,
  peticion,
  suscribirCambioToken,
  suscribirCambiosEnVivo,
  suscribirServidorNegocio,
  tieneServidorNegocioVinculado,
  tokensEnMemoria
} from './api';

export interface ItemCarritoImportador {
  producto_id: number;
  codigo: string;
  categoria: string;
  medidas: string;
  stockActual: number;
  stockMinimo: number;
  faltante: number;
  cantidad: number;
  importador: string;
  emailImportador: string;
  agregadoEn: string;
}

export interface EstadoCarritoImportador {
  importador: string;
  emailImportador: string;
  notas: string;
  items: ItemCarritoImportador[];
  version?: number;
  actualizadoEn?: string | null;
}

interface RespuestaCarritoRemoto extends EstadoCarritoImportador {
  negocioId?: string;
}

export interface RespuestaPdfCarrito {
  ordenId: string;
  nombreArchivo: string;
  totalCodigos: number;
  totalUnidades: number;
  importador: string;
  emailImportador: string;
  correo: { enviado: boolean; detalle: string };
  pdfBase64: string;
}

type ListenerCarrito = (estado: EstadoCarritoImportador) => void;
const listeners = new Set<ListenerCarrito>();

const carritosPorNegocio: Record<string, EstadoCarritoImportador> = {};
const migracionInicialRevisada = new Set<string>();

let cargadoInicial = false;
let negocioPrevioId = '';
let secuenciaMutacion = 0;
let escriturasEnCurso = 0;
let colaEscrituras: Promise<void> = Promise.resolve();
let sincronizacionEnCurso: Promise<EstadoCarritoImportador> | null = null;
let ultimaSincronizacionMs = 0;

let timerDatosImportador: ReturnType<typeof setTimeout> | null = null;
let datosPendientesImportador: {
  negocioId: string;
  datos: { importador?: string; emailImportador?: string; notas?: string };
} | null = null;

const timersCantidad = new Map<
  string,
  {
    timer: ReturnType<typeof setTimeout>;
    negocioId: string;
    codigo: string;
    cantidad: number;
    seq: number;
  }
>();

function estadoVacio(): EstadoCarritoImportador {
  return {
    importador: '',
    emailImportador: '',
    notas: '',
    items: [],
    version: 0,
    actualizadoEn: null
  };
}

function claveNegocioActual(): string {
  const srv = obtenerServidorActivo();
  if (!srv.id || srv.id === 'sin_servidor') return 'sin_servidor';
  return srv.id;
}

function puedeSincronizarConServidor(): boolean {
  if (!tieneServidorNegocioVinculado()) return false;
  const id = claveNegocioActual();
  if (!id || id === 'sin_servidor') return false;
  return Boolean(tokensEnMemoria().acceso);
}

function normalizarEstadoRemoto(remoto: Partial<EstadoCarritoImportador> | null | undefined): EstadoCarritoImportador {
  if (!remoto || typeof remoto !== 'object') return estadoVacio();
  const items = Array.isArray(remoto.items)
    ? remoto.items.map((it) => ({
        producto_id: Number(it.producto_id) || 0,
        codigo: String(it.codigo ?? ''),
        categoria: String(it.categoria || 'General'),
        medidas: String(it.medidas || '—'),
        stockActual: Number(it.stockActual) || 0,
        stockMinimo: Number(it.stockMinimo) || 0,
        faltante: Number(it.faltante) || 0,
        cantidad: Math.max(1, Math.round(Number(it.cantidad) || 1)),
        importador: String(it.importador ?? ''),
        emailImportador: String(it.emailImportador ?? ''),
        agregadoEn: String(it.agregadoEn || new Date().toISOString())
      }))
    : [];

  return {
    importador: String(remoto.importador ?? ''),
    emailImportador: String(remoto.emailImportador ?? ''),
    notas: String(remoto.notas ?? ''),
    items,
    version: Number(remoto.version ?? 0),
    actualizadoEn: remoto.actualizadoEn ?? null
  };
}

function sonEstadosIguales(a: EstadoCarritoImportador | undefined, b: EstadoCarritoImportador): boolean {
  if (!a) return false;
  if (
    a.importador !== b.importador ||
    a.emailImportador !== b.emailImportador ||
    a.notas !== b.notas ||
    (a.version ?? 0) !== (b.version ?? 0) ||
    a.items.length !== b.items.length
  ) {
    return false;
  }
  for (let i = 0; i < a.items.length; i += 1) {
    const x = a.items[i];
    const y = b.items[i];
    if (
      !x ||
      !y ||
      x.codigo !== y.codigo ||
      x.cantidad !== y.cantidad ||
      x.producto_id !== y.producto_id ||
      x.importador !== y.importador ||
      x.emailImportador !== y.emailImportador ||
      x.stockActual !== y.stockActual ||
      x.stockMinimo !== y.stockMinimo
    ) {
      return false;
    }
  }
  return true;
}

function hayEscriturasLocalesPendientes(): boolean {
  return escriturasEnCurso > 0 || timerDatosImportador !== null || timersCantidad.size > 0;
}

function emitir(): void {
  const actual = obtenerCarritoActual();
  for (const fn of Array.from(listeners)) {
    try {
      fn(actual);
    } catch {
      /* ignorar error en listener */
    }
  }
}

async function persistir(): Promise<void> {
  try {
    await guardar(CLAVES.carritoReposicion, JSON.stringify(carritosPorNegocio));
  } catch {
    /* ignorar */
  }
}

function aplicarEstadoServidorSiVigente(
  negocioId: string,
  remoto: RespuestaCarritoRemoto | null | undefined,
  seqEsperada?: number
): EstadoCarritoImportador {
  const normalizado = normalizarEstadoRemoto(remoto);
  if (seqEsperada !== undefined && seqEsperada !== secuenciaMutacion) {
    return obtenerCarritoActual();
  }
  const previo = carritosPorNegocio[negocioId];
  if (!sonEstadosIguales(previo, normalizado)) {
    carritosPorNegocio[negocioId] = normalizado;
    void persistir();
    if (claveNegocioActual() === negocioId) {
      emitir();
    }
  }
  return carritosPorNegocio[negocioId] ?? normalizado;
}

function encolarEscritura(
  trabajo: () => Promise<RespuestaCarritoRemoto | null | undefined>,
  negocioId: string,
  seq: number
): Promise<EstadoCarritoImportador> {
  escriturasEnCurso += 1;

  const siguiente = colaEscrituras.then(async () => {
    try {
      if (!puedeSincronizarConServidor() || claveNegocioActual() !== negocioId) {
        return;
      }
      const remoto = await trabajo();
      if (remoto && claveNegocioActual() === negocioId && seq === secuenciaMutacion) {
        aplicarEstadoServidorSiVigente(negocioId, remoto, seq);
      }
    } catch {
      /* conservar cambio optimista local si hay microcorte de red */
    } finally {
      escriturasEnCurso = Math.max(0, escriturasEnCurso - 1);
    }
  });

  colaEscrituras = siguiente.catch(() => {});
  return siguiente.then(() => obtenerCarritoActual());
}

/**
 * Carga el respaldo local guardado en el dispositivo y luego sincroniza con el servidor.
 */
export async function cargarCarritoGuardado(): Promise<void> {
  if (cargadoInicial) return;
  cargadoInicial = true;
  try {
    const crudo = await obtener(CLAVES.carritoReposicion);
    if (crudo) {
      const parseado = JSON.parse(crudo) as Record<string, EstadoCarritoImportador>;
      if (parseado && typeof parseado === 'object') {
        for (const [k, v] of Object.entries(parseado)) {
          if (!carritosPorNegocio[k]) {
            carritosPorNegocio[k] = normalizarEstadoRemoto(v);
          }
        }
        emitir();
      }
    }
  } catch {
    /* ignorar */
  }

  if (puedeSincronizarConServidor()) {
    void sincronizarCarritoDesdeServidor(true);
  }
}

/**
 * Trae el estado real del carrito desde el servidor para el negocio activo.
 * Todos los dispositivos conectados al mismo servidor reciben exactamente los mismos productos.
 */
export async function sincronizarCarritoDesdeServidor(
  forzar = false
): Promise<EstadoCarritoImportador> {
  if (!puedeSincronizarConServidor()) {
    return obtenerCarritoActual();
  }

  if (!forzar && hayEscriturasLocalesPendientes()) {
    return obtenerCarritoActual();
  }

  if (forzar && escriturasEnCurso > 0) {
    await colaEscrituras;
  }

  if (hayEscriturasLocalesPendientes()) {
    return obtenerCarritoActual();
  }

  const ahora = Date.now();
  if (!forzar && ahora - ultimaSincronizacionMs < 400) {
    return obtenerCarritoActual();
  }

  if (sincronizacionEnCurso) {
    return sincronizacionEnCurso;
  }

  const negocioAlIniciar = claveNegocioActual();
  const seqAlIniciar = secuenciaMutacion;
  ultimaSincronizacionMs = ahora;

  sincronizacionEnCurso = (async () => {
    try {
      const remoto = await peticion<RespuestaCarritoRemoto>('/carrito');

      // Si el usuario cambió de servidor o realizó una edición local mientras viajaba el GET, no pisar
      if (claveNegocioActual() !== negocioAlIniciar) {
        return obtenerCarritoActual();
      }
      if (seqAlIniciar !== secuenciaMutacion || hayEscriturasLocalesPendientes()) {
        return obtenerCarritoActual();
      }

      const localActual = carritosPorNegocio[negocioAlIniciar];
      const versionRemota = Number(remoto?.version ?? 0);
      const itemsRemotos = Array.isArray(remoto?.items) ? remoto.items : [];

      // Migración única: si el servidor recién se estrena (versión 0 y vacío) y este dispositivo
      // ya tenía productos cargados localmente antes de activar el sync en vivo, los subimos.
      if (
        versionRemota === 0 &&
        itemsRemotos.length === 0 &&
        !migracionInicialRevisada.has(negocioAlIniciar)
      ) {
        migracionInicialRevisada.add(negocioAlIniciar);
        if (localActual && localActual.items.length > 0) {
          try {
            const migrado = await peticion<RespuestaCarritoRemoto>('/carrito/sincronizar-inicial', {
              metodo: 'POST',
              cuerpo: {
                importador: localActual.importador,
                emailImportador: localActual.emailImportador,
                notas: localActual.notas,
                items: localActual.items
              }
            });
            return aplicarEstadoServidorSiVigente(negocioAlIniciar, migrado, seqAlIniciar);
          } catch {
            return obtenerCarritoActual();
          }
        }
      } else {
        migracionInicialRevisada.add(negocioAlIniciar);
      }

      return aplicarEstadoServidorSiVigente(negocioAlIniciar, remoto, seqAlIniciar);
    } catch {
      return obtenerCarritoActual();
    } finally {
      sincronizacionEnCurso = null;
    }
  })();

  return sincronizacionEnCurso;
}

/**
 * Fuerza el envío inmediato de cualquier edición debounced pendiente antes de generar PDF o cambiar de servidor.
 */
export async function flushearCambiosPendientesCarrito(): Promise<void> {
  if (timerDatosImportador && datosPendientesImportador) {
    clearTimeout(timerDatosImportador);
    timerDatosImportador = null;
    const pendiente = datosPendientesImportador;
    datosPendientesImportador = null;
    const seq = secuenciaMutacion;
    await encolarEscritura(
      () =>
        peticion<RespuestaCarritoRemoto>('/carrito/datos', {
          metodo: 'PATCH',
          cuerpo: pendiente.datos
        }),
      pendiente.negocioId,
      seq
    );
  }

  const pendientesCantidad = Array.from(timersCantidad.entries());
  timersCantidad.clear();
  for (const [, entry] of pendientesCantidad) {
    clearTimeout(entry.timer);
    await encolarEscritura(
      () =>
        peticion<RespuestaCarritoRemoto>('/carrito/items', {
          metodo: 'PATCH',
          cuerpo: { codigo: entry.codigo, cantidad: entry.cantidad }
        }),
      entry.negocioId,
      entry.seq
    );
  }

  await colaEscrituras;
}

void cargarCarritoGuardado();

// Suscripción al motor global de sincronización en vivo: actualiza el carrito en tiempo real
// cuando cualquier otro dispositivo conectado al mismo servidor modifica el carrito.
suscribirCambiosEnVivo(() => {
  if (puedeSincronizarConServidor()) {
    void sincronizarCarritoDesdeServidor(false);
  }
});

// Suscripción a cambios de servidor de negocio (Negocio 1 ↔ Negocio 2): cambia el carrito activo
// inmediatamente y sincroniza el estado vivo de ese servidor.
suscribirServidorNegocio((activo, _todos, vinculado) => {
  const nuevoId = vinculado && activo.id !== 'sin_servidor' ? activo.id : 'sin_servidor';
  if (nuevoId !== negocioPrevioId) {
    negocioPrevioId = nuevoId;
    emitir();
    if (vinculado && puedeSincronizarConServidor()) {
      void sincronizarCarritoDesdeServidor(true);
    }
  }
});

// Cuando el usuario inicia sesión o se restauran los tokens, sincronizar inmediatamente el carrito.
suscribirCambioToken((autenticado) => {
  if (autenticado && puedeSincronizarConServidor()) {
    void sincronizarCarritoDesdeServidor(true);
  }
});

// Sincronización instantánea entre pestañas del mismo navegador Web.
if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  window.addEventListener('storage', (ev) => {
    if (ev.key !== CLAVES.carritoReposicion || !ev.newValue) return;
    try {
      const parseado = JSON.parse(ev.newValue) as Record<string, EstadoCarritoImportador>;
      if (parseado && typeof parseado === 'object') {
        Object.assign(carritosPorNegocio, parseado);
        emitir();
      }
    } catch {
      /* ignorar */
    }
  });
}

export function obtenerCarritoActual(): EstadoCarritoImportador {
  const id = claveNegocioActual();
  if (!carritosPorNegocio[id]) {
    carritosPorNegocio[id] = estadoVacio();
  }
  return carritosPorNegocio[id];
}

export function suscribirCarrito(listener: ListenerCarrito): () => void {
  listeners.add(listener);
  listener(obtenerCarritoActual());
  return () => {
    listeners.delete(listener);
  };
}

export function useCarritoImportador(): EstadoCarritoImportador {
  const [estado, setEstado] = useState<EstadoCarritoImportador>(() => obtenerCarritoActual());
  useEffect(() => suscribirCarrito(setEstado), []);
  return estado;
}

export function agregarProductoAlCarrito(entrada: {
  producto_id: number;
  codigo: string;
  categoria?: string | null;
  medidas?: string | null;
  stockActual: number;
  stockMinimo: number;
  faltante?: number;
  cantidad: number;
  importador: string;
  emailImportador: string;
}): Promise<EstadoCarritoImportador> {
  const id = claveNegocioActual();
  const actual = obtenerCarritoActual();
  const importadorLimpio = entrada.importador.trim();
  const emailLimpio = entrada.emailImportador.trim().toLowerCase();
  const cant = Math.max(1, Math.round(Number(entrada.cantidad) || 1));

  // Cancelar cualquier debounce pendiente de cantidad sobre el mismo código
  const claveTimer = `${id}::${entrada.codigo}`;
  const timerPrevio = timersCantidad.get(claveTimer);
  if (timerPrevio) {
    clearTimeout(timerPrevio.timer);
    timersCantidad.delete(claveTimer);
  }

  const idx = actual.items.findIndex(
    (it) => it.codigo === entrada.codigo || (entrada.producto_id > 0 && it.producto_id === entrada.producto_id)
  );

  const nuevoItem: ItemCarritoImportador = {
    producto_id: entrada.producto_id,
    codigo: entrada.codigo,
    categoria: entrada.categoria || 'General',
    medidas: entrada.medidas || '—',
    stockActual: Number(entrada.stockActual) || 0,
    stockMinimo: Number(entrada.stockMinimo) || 0,
    faltante: Number(entrada.faltante ?? Math.max(0, entrada.stockMinimo - entrada.stockActual)),
    cantidad: idx >= 0 ? (actual.items[idx]?.cantidad ?? 0) + cant : cant,
    importador: importadorLimpio,
    emailImportador: emailLimpio,
    agregadoEn: new Date().toISOString()
  };

  const nuevaLista =
    idx >= 0
      ? actual.items.map((it, i) => (i === idx ? nuevoItem : it))
      : [...actual.items, nuevoItem];

  carritosPorNegocio[id] = {
    ...actual,
    importador: importadorLimpio || actual.importador,
    emailImportador: emailLimpio || actual.emailImportador,
    items: nuevaLista
  };

  secuenciaMutacion += 1;
  const seq = secuenciaMutacion;
  void persistir();
  emitir();

  return encolarEscritura(
    () =>
      peticion<RespuestaCarritoRemoto>('/carrito/items', {
        metodo: 'POST',
        cuerpo: {
          producto_id: entrada.producto_id,
          codigo: entrada.codigo,
          categoria: entrada.categoria || 'General',
          medidas: entrada.medidas || '—',
          stockActual: Number(entrada.stockActual) || 0,
          stockMinimo: Number(entrada.stockMinimo) || 0,
          faltante: Number(entrada.faltante ?? Math.max(0, entrada.stockMinimo - entrada.stockActual)),
          cantidad: cant,
          importador: importadorLimpio,
          emailImportador: emailLimpio
        }
      }),
    id,
    seq
  );
}

export function actualizarDatosImportadorCarrito(datos: {
  importador?: string;
  emailImportador?: string;
  notas?: string;
}): void {
  const id = claveNegocioActual();
  const actual = obtenerCarritoActual();
  carritosPorNegocio[id] = {
    ...actual,
    importador: datos.importador !== undefined ? datos.importador : actual.importador,
    emailImportador:
      datos.emailImportador !== undefined ? datos.emailImportador : actual.emailImportador,
    notas: datos.notas !== undefined ? datos.notas : actual.notas
  };

  secuenciaMutacion += 1;
  void persistir();
  emitir();

  if (!puedeSincronizarConServidor()) return;

  if (timerDatosImportador) {
    clearTimeout(timerDatosImportador);
  }

  const acumulados =
    datosPendientesImportador && datosPendientesImportador.negocioId === id
      ? { ...datosPendientesImportador.datos, ...datos }
      : { ...datos };

  datosPendientesImportador = { negocioId: id, datos: acumulados };
  const seq = secuenciaMutacion;

  timerDatosImportador = setTimeout(() => {
    const aEnviar = datosPendientesImportador;
    timerDatosImportador = null;
    datosPendientesImportador = null;
    if (!aEnviar) return;
    void encolarEscritura(
      () =>
        peticion<RespuestaCarritoRemoto>('/carrito/datos', {
          metodo: 'PATCH',
          cuerpo: aEnviar.datos
        }),
      aEnviar.negocioId,
      seq
    );
  }, 450);
}

export function cambiarCantidadItemCarrito(codigo: string, nuevaCantidad: number): void {
  const id = claveNegocioActual();
  const actual = obtenerCarritoActual();
  if (nuevaCantidad <= 0) {
    void quitarItemCarrito(codigo);
    return;
  }

  const cantFinal = Math.max(1, Math.round(nuevaCantidad));
  carritosPorNegocio[id] = {
    ...actual,
    items: actual.items.map((it) => (it.codigo === codigo ? { ...it, cantidad: cantFinal } : it))
  };

  secuenciaMutacion += 1;
  const seq = secuenciaMutacion;
  void persistir();
  emitir();

  if (!puedeSincronizarConServidor()) return;

  const claveTimer = `${id}::${codigo}`;
  const existente = timersCantidad.get(claveTimer);
  if (existente) {
    clearTimeout(existente.timer);
  }

  const timer = setTimeout(() => {
    timersCantidad.delete(claveTimer);
    void encolarEscritura(
      () =>
        peticion<RespuestaCarritoRemoto>('/carrito/items', {
          metodo: 'PATCH',
          cuerpo: { codigo, cantidad: cantFinal }
        }),
      id,
      seq
    );
  }, 220);

  timersCantidad.set(claveTimer, { timer, negocioId: id, codigo, cantidad: cantFinal, seq });
}

export function quitarItemCarrito(codigo: string): Promise<EstadoCarritoImportador> {
  const id = claveNegocioActual();
  const actual = obtenerCarritoActual();

  const claveTimer = `${id}::${codigo}`;
  const existente = timersCantidad.get(claveTimer);
  if (existente) {
    clearTimeout(existente.timer);
    timersCantidad.delete(claveTimer);
  }

  carritosPorNegocio[id] = {
    ...actual,
    items: actual.items.filter((it) => it.codigo !== codigo)
  };

  secuenciaMutacion += 1;
  const seq = secuenciaMutacion;
  void persistir();
  emitir();

  return encolarEscritura(
    () =>
      peticion<RespuestaCarritoRemoto>('/carrito/items', {
        metodo: 'DELETE',
        consulta: { codigo }
      }),
    id,
    seq
  );
}

export function vaciarCarrito(): Promise<EstadoCarritoImportador> {
  const id = claveNegocioActual();
  const actual = obtenerCarritoActual();

  for (const [clave, entry] of Array.from(timersCantidad.entries())) {
    if (entry.negocioId === id) {
      clearTimeout(entry.timer);
      timersCantidad.delete(clave);
    }
  }

  carritosPorNegocio[id] = {
    ...actual,
    items: []
  };

  secuenciaMutacion += 1;
  const seq = secuenciaMutacion;
  void persistir();
  emitir();

  return encolarEscritura(
    () =>
      peticion<RespuestaCarritoRemoto>('/carrito', {
        metodo: 'DELETE'
      }),
    id,
    seq
  );
}

/** Construye un PDF binario válido en el cliente como respaldo inmediato si el servidor remoto no tiene la ruta. */
function construirPdfBase64Local(datos: {
  importador: string;
  emailImportador: string;
  negocioNombre: string;
  notas: string;
  items: ItemCarritoImportador[];
}): { pdfBase64: string; ordenId: string; nombreArchivo: string; totalUnidades: number } {
  const limpiar = (t: string) =>
    String(t ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\x20-\x7E]/g, ' ')
      .replace(/([()\\])/g, '\\$1');

  const ordenId = `OC-${Date.now().toString().slice(-6)}`;
  const totalUnidades = datos.items.reduce((acc, it) => acc + (Number(it.cantidad) || 1), 0);
  const fecha = new Date().toLocaleString('es-AR');

  const ops: string[] = [
    '0.706 0.325 0.227 rg',
    '40 760 515 52 re f',
    '1 1 1 rg',
    `BT /F2 15 Tf 52 788 Td (${limpiar('STOCKER - ORDEN DE COMPRA A IMPORTADORA')}) Tj ET`,
    `BT /F1 10 Tf 52 770 Td (${limpiar(`Orden: ${ordenId}  |  Fecha: ${fecha}  |  ${datos.negocioNombre}`)}) Tj ET`,
    '0.96 0.94 0.91 rg',
    '40 692 515 56 re f',
    '0.23 0.18 0.16 rg',
    `BT /F2 11 Tf 52 730 Td (${limpiar(`IMPORTADOR: ${datos.importador}`)}) Tj ET`,
    `BT /F1 10 Tf 52 714 Td (${limpiar(`EMAIL: ${datos.emailImportador}`)}) Tj ET`,
    `BT /F1 9 Tf 52 699 Td (${limpiar(datos.notas || 'Pedido de reposicion por alerta de bajo stock')}) Tj ET`,
    '0.37 0.45 0.27 rg',
    '40 660 515 22 re f',
    '1 1 1 rg',
    'BT /F2 10 Tf 50 667 Td (NRO) Tj ET',
    'BT /F2 10 Tf 95 667 Td (CODIGO PRODUCTO) Tj ET',
    'BT /F2 10 Tf 230 667 Td (DETALLE / MEDIDAS) Tj ET',
    'BT /F2 10 Tf 430 667 Td (CANT. SOLICITADA) Tj ET'
  ];

  let y = 640;
  datos.items.slice(0, 24).forEach((it, idx) => {
    ops.push('0.23 0.18 0.16 rg');
    ops.push(`BT /F1 10 Tf 52 ${y} Td (${String(idx + 1).padStart(2, '0')}) Tj ET`);
    ops.push(`BT /F2 10 Tf 95 ${y} Td (${limpiar(it.codigo)}) Tj ET`);
    ops.push(
      `BT /F1 9 Tf 230 ${y} Td (${limpiar(`${it.categoria} ${it.medidas}`.slice(0, 32))}) Tj ET`
    );
    ops.push(`BT /F2 10 Tf 455 ${y} Td (${limpiar(`${it.cantidad} u.`)}) Tj ET`);
    y -= 20;
  });

  y -= 10;
  ops.push('0.706 0.325 0.227 rg');
  ops.push(`40 ${y} 515 24 re f`);
  ops.push('1 1 1 rg');
  ops.push(
    `BT /F2 11 Tf 52 ${y + 7} Td (${limpiar(
      `TOTAL CODIGOS: ${datos.items.length}   |   TOTAL UNIDADES SOLICITADAS: ${totalUnidades}`
    )}) Tj ET`
  );

  const stream = ops.join('\n');
  const objs = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj\n',
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n',
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n',
    `6 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj\n`
  ];
  let pdf = '%PDF-1.4\n';
  const offs = [0];
  for (const o of objs) {
    offs.push(pdf.length);
    pdf += o;
  }
  const xref = pdf.length;
  pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objs.length; i += 1) {
    pdf += `${String(offs[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;

  const codificarB64 = (str: string): string => {
    if (typeof btoa === 'function') return btoa(str);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let out = '';
    for (let i = 0; i < str.length; i += 3) {
      const c1 = str.charCodeAt(i);
      const c2 = i + 1 < str.length ? str.charCodeAt(i + 1) : Number.NaN;
      const c3 = i + 2 < str.length ? str.charCodeAt(i + 2) : Number.NaN;
      const e1 = c1 >> 2;
      const e2 = ((c1 & 3) << 4) | (c2 >> 4);
      const e3 = Number.isNaN(c2) ? 64 : ((c2 & 15) << 2) | (c3 >> 6);
      const e4 = Number.isNaN(c3) ? 64 : c3 & 63;
      out += chars.charAt(e1) + chars.charAt(e2) + chars.charAt(e3) + chars.charAt(e4);
    }
    return out;
  };

  return {
    pdfBase64: codificarB64(pdf),
    ordenId,
    nombreArchivo: `pedido_${ordenId.toLowerCase()}.pdf`,
    totalUnidades
  };
}

/**
 * Solicita al backend generar el PDF del carrito (y opcionalmente enviarlo por correo a la importadora),
 * y dispara la descarga / apertura del PDF y del cliente de correo.
 */
export async function generarYEnviarPdfCarrito(opciones: {
  enviarEmail: boolean;
}): Promise<RespuestaPdfCarrito> {
  await flushearCambiosPendientesCarrito();

  const actual = obtenerCarritoActual();
  const servidor = obtenerServidorActivo();
  const importador = actual.importador.trim();
  const emailImportador = actual.emailImportador.trim().toLowerCase();

  if (!importador) {
    throw new Error('Ingresá el nombre del importador o proveedor.');
  }
  if (!emailImportador || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailImportador)) {
    throw new Error('Ingresá un correo electrónico válido para la importadora.');
  }
  if (actual.items.length === 0) {
    throw new Error('El carrito está vacío. Añadí al menos un producto en alerta de stock.');
  }

  let respuesta: RespuestaPdfCarrito;
  try {
    respuesta = await peticion<RespuestaPdfCarrito>('/reportes/carrito-pdf', {
      metodo: 'POST',
      cuerpo: {
        importador,
        emailImportador,
        negocioNombre: servidor.nombre,
        notas: actual.notas,
        enviarEmail: opciones.enviarEmail,
        items: actual.items
      }
    });
  } catch {
    const local = construirPdfBase64Local({
      importador,
      emailImportador,
      negocioNombre: servidor.nombre,
      notas: actual.notas,
      items: actual.items
    });
    respuesta = {
      ordenId: local.ordenId,
      nombreArchivo: local.nombreArchivo,
      totalCodigos: actual.items.length,
      totalUnidades: local.totalUnidades,
      importador,
      emailImportador,
      correo: {
        enviado: false,
        detalle: 'PDF generado localmente listo para adjuntar.'
      },
      pdfBase64: local.pdfBase64
    };
  }

  // Descargar el archivo PDF en Web
  if (Platform.OS === 'web' && typeof document !== 'undefined' && respuesta.pdfBase64) {
    try {
      const bin = atob(respuesta.pdfBase64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const urlBlob = URL.createObjectURL(blob);
      const enlace = document.createElement('a');
      enlace.href = urlBlob;
      enlace.download = respuesta.nombreArchivo || 'pedido_importador.pdf';
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      setTimeout(() => URL.revokeObjectURL(urlBlob), 10000);
    } catch {
      /* ignorar fallo de descarga en navegador */
    }
  }

  // Si pidió enviar a la importadora y el backend no lo envió directamente por Apps Script, abrir mailto con el detalle completo
  if (opciones.enviarEmail && !respuesta.correo?.enviado) {
    const asunto = encodeURIComponent(
      `Orden de Pedido ${respuesta.ordenId} - ${servidor.nombre} para ${importador}`
    );
    const detalleLineas = actual.items
      .map(
        (it, i) =>
          `${i + 1}. Código: ${it.codigo} | Cantidad solicitada: ${it.cantidad} unidades (${it.categoria} · ${it.medidas})`
      )
      .join('\n');
    const cuerpoMail = encodeURIComponent(
      `Estimados ${importador},\n\n` +
        `Enviamos la solicitud de reposición de stock desde ${servidor.nombre} (Orden ${respuesta.ordenId}):\n\n` +
        `${detalleLineas}\n\n` +
        `Total de códigos: ${actual.items.length}\n` +
        `Total de unidades solicitadas: ${respuesta.totalUnidades}\n` +
        (actual.notas ? `\nObservaciones: ${actual.notas}\n` : '') +
        `\n(Se adjunta / generó el comprobante PDF: ${respuesta.nombreArchivo})\n\nSaludos cordiales.`
    );
    const mailtoUrl = `mailto:${emailImportador}?subject=${asunto}&body=${cuerpoMail}`;
    try {
      await Linking.openURL(mailtoUrl);
    } catch {
      /* si el dispositivo no tiene cliente mail configurado, el PDF igual quedó generado */
    }
  }

  return respuesta;
}

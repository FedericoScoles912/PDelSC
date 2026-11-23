/**
 * @file Servicio y Monitor en Vivo de Actualizaciones Automáticas Over-The-Air (OTA)
 *       mediante el módulo oficial `expo-updates` (EAS Update).
 *
 *       - Detecta en vivo nuevas publicaciones en EAS (`Updates.checkForUpdateAsync()`)
 *         tanto al iniciar, al volver al primer plano, periódicamente cada 25 segundos
 *         con la app abierta, y manualmente desde "Mi Cuenta".
 *       - Escucha la máquina de estados nativa de `expo-updates` (`Updates.useUpdates()`)
 *         para registrar `updateId`, `createdAt`, `channel`, `isEmbeddedLaunch`,
 *         progreso de descarga (`downloadProgress`), `isUpdateAvailable` e `isUpdatePending`.
 *       - Cuando una actualización termina de descargarse (`isUpdatePending` o tras
 *         `Updates.fetchUpdateAsync()`), ejecuta automáticamente `Updates.reloadAsync()`
 *         para renderizar la nueva versión en vivo sin que el usuario tenga que cerrar
 *         ni volver a abrir la aplicación.
 * @module client/src/servicios/actualizaciones
 */

import { Ionicons } from '@expo/vector-icons';
import * as Updates from 'expo-updates';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, Platform, Pressable, Text, View } from 'react-native';

import { useTema } from '../tema/TemaProvider';
import { CLAVES, guardar, obtener } from './almacenamiento';
import { URL_API, emitirRecargaGlobalEnVivo } from './api';

export const VERSION_APP_LOCAL = '1.2.0';

export interface EstadoActualizacionOta {
  versionActual: string;
  versionServidor: string;
  runtimeVersion: string;
  canal: string;
  updateId: string | null;
  updateIdCorto: string;
  fechaUpdate: string | null;
  mensajeUpdate: string | null;
  esBundleOtaDescargado: boolean;
  otaNativoHabilitado: boolean;
  autoActualizar: boolean;
  verificando: boolean;
  descargando: boolean;
  progresoDescarga: number;
  actualizacionDisponible: boolean;
  actualizacionPendienteRecarga: boolean;
  ultimaVerificacion: string | null;
  mensajeEstado: string;
  errorDetalle: string | null;
}

type ListenerOta = (estado: EstadoActualizacionOta) => void;
const listeners = new Set<ListenerOta>();

function extraerMensajeManifest(manifest: unknown): string | null {
  if (!manifest || typeof manifest !== 'object') return null;
  const m = manifest as Record<string, any>;
  return (
    m?.extra?.expoClient?.extra?.otaMessage ||
    m?.metadata?.message ||
    m?.extra?.message ||
    null
  );
}

function formatearFechaCorta(fecha: Date | string | null | undefined): string | null {
  if (!fecha) return null;
  const d = fecha instanceof Date ? fecha : new Date(fecha);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function leerDatosNativosIniciales() {
  const id = Updates.updateId ?? null;
  const idCorto = id ? id.slice(0, 8) : 'base-apk';
  const canal = Updates.channel || 'preview';
  const runtime = Updates.runtimeVersion || VERSION_APP_LOCAL;
  const esOta = Boolean(Updates.isEnabled && !Updates.isEmbeddedLaunch && id);
  const fecha = formatearFechaCorta(Updates.createdAt);
  const msg = extraerMensajeManifest(Updates.manifest);

  return {
    id,
    idCorto,
    canal,
    runtime,
    esOta,
    fecha,
    msg,
    habilitado: Boolean(Updates.isEnabled && Platform.OS !== 'web')
  };
}

const inicial = leerDatosNativosIniciales();

let estadoOta: EstadoActualizacionOta = {
  versionActual: VERSION_APP_LOCAL,
  versionServidor: VERSION_APP_LOCAL,
  runtimeVersion: inicial.runtime,
  canal: inicial.canal,
  updateId: inicial.id,
  updateIdCorto: inicial.idCorto,
  fechaUpdate: inicial.fecha,
  mensajeUpdate: inicial.msg,
  esBundleOtaDescargado: inicial.esOta,
  otaNativoHabilitado: inicial.habilitado,
  autoActualizar: true,
  verificando: false,
  descargando: false,
  progresoDescarga: 0,
  actualizacionDisponible: false,
  actualizacionPendienteRecarga: false,
  ultimaVerificacion: null,
  mensajeEstado: inicial.esOta
    ? `Update OTA activo (${inicial.idCorto}) · Canal ${inicial.canal}`
    : inicial.habilitado
      ? `Conectado a EAS Update (Canal ${inicial.canal} · ID ${inicial.idCorto})`
      : 'Modo desarrollo / Web activo',
  errorDetalle: null
};

let inicializado = false;
let operacionEnCurso = false;
let recargandoApp = false;

function notificar(): void {
  for (const fn of Array.from(listeners)) {
    try {
      fn({ ...estadoOta });
    } catch {
      /* ignorar */
    }
  }
}

export function obtenerEstadoActualizacion(): EstadoActualizacionOta {
  return { ...estadoOta };
}

export function suscribirActualizaciones(listener: ListenerOta): () => void {
  listeners.add(listener);
  listener({ ...estadoOta });
  return () => {
    listeners.delete(listener);
  };
}

export function useActualizacionesOta(): EstadoActualizacionOta {
  const [estado, setEstado] = useState<EstadoActualizacionOta>(() => obtenerEstadoActualizacion());
  useEffect(() => suscribirActualizaciones(setEstado), []);
  return estado;
}

export async function configurarAutoActualizarOta(activo: boolean): Promise<void> {
  estadoOta = {
    ...estadoOta,
    autoActualizar: activo,
    mensajeEstado: activo
      ? 'Actualizaciones automáticas en vivo activadas'
      : 'Actualizaciones OTA en modo manual'
  };
  notificar();
  await guardar(CLAVES.autoUpdateOta, activo ? '1' : '0');

  if (activo && estadoOta.actualizacionPendienteRecarga) {
    await aplicarRecargaOtaInmediata();
  }
}

/**
 * Recarga el runtime JS inmediatamente para aplicar la última actualización OTA descargada.
 */
export async function aplicarRecargaOtaInmediata(): Promise<boolean> {
  if (recargandoApp) return true;
  if (Platform.OS === 'web') {
    emitirRecargaGlobalEnVivo();
    if (typeof window !== 'undefined' && window.location) {
      window.location.reload();
    }
    return true;
  }

  if (!Updates.isEnabled) {
    emitirRecargaGlobalEnVivo();
    return false;
  }

  try {
    recargandoApp = true;
    estadoOta = {
      ...estadoOta,
      descargando: false,
      verificando: false,
      actualizacionPendienteRecarga: false,
      mensajeEstado: 'Aplicando nueva actualización OTA en vivo…'
    };
    notificar();

    await Updates.reloadAsync();
    return true;
  } catch (err) {
    recargandoApp = false;
    estadoOta = {
      ...estadoOta,
      errorDetalle: err instanceof Error ? err.message : 'No se pudo recargar el bundle.',
      mensajeEstado: 'No se pudo recargar automáticamente; intentá pulsar "Aplicar ahora".'
    };
    notificar();
    return false;
  }
}

/**
 * Verifica directamente contra los servidores de EAS Update (`Updates.checkForUpdateAsync()`)
 * si existe un nuevo bundle publicado para el canal actual. Si existe, lo descarga con
 * `Updates.fetchUpdateAsync()` y recarga la app en vivo con `Updates.reloadAsync()`.
 */
export async function verificarYAplicarActualizacionOta(
  manual = false
): Promise<{ aplicada: boolean; disponible: boolean; mensaje: string }> {
  if (operacionEnCurso) {
    return {
      aplicada: false,
      disponible: estadoOta.actualizacionDisponible,
      mensaje: estadoOta.mensajeEstado
    };
  }

  operacionEnCurso = true;
  const hora = new Date().toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const infoNativa = leerDatosNativosIniciales();
  estadoOta = {
    ...estadoOta,
    verificando: true,
    errorDetalle: null,
    updateId: infoNativa.id,
    updateIdCorto: infoNativa.idCorto,
    canal: infoNativa.canal,
    runtimeVersion: infoNativa.runtime,
    fechaUpdate: infoNativa.fecha,
    esBundleOtaDescargado: infoNativa.esOta,
    otaNativoHabilitado: infoNativa.habilitado,
    mensajeEstado: manual
      ? 'Consultando servidores de EAS Update en vivo…'
      : estadoOta.mensajeEstado
  };
  notificar();

  try {
    // 1) En APK nativo con EAS Update habilitado: usar el módulo oficial `expo-updates`
    if (Platform.OS !== 'web' && Updates.isEnabled) {
      // Si ya había una actualización descargada pendiente de aplicar, recargar de inmediato
      if (estadoOta.actualizacionPendienteRecarga && (estadoOta.autoActualizar || manual)) {
        operacionEnCurso = false;
        await aplicarRecargaOtaInmediata();
        return {
          aplicada: true,
          disponible: true,
          mensaje: 'Actualización OTA aplicada en vivo.'
        };
      }

      const resultadoCheck = await Updates.checkForUpdateAsync();

      if (resultadoCheck.isAvailable) {
        const nuevoId =
          (resultadoCheck.manifest as any)?.id
            ? String((resultadoCheck.manifest as any).id).slice(0, 8)
            : 'nuevo';

        estadoOta = {
          ...estadoOta,
          verificando: false,
          descargando: true,
          actualizacionDisponible: true,
          ultimaVerificacion: hora,
          mensajeEstado: `¡Nueva actualización OTA detectada (${nuevoId})! Descargando en vivo…`
        };
        notificar();

        const resultadoFetch = await Updates.fetchUpdateAsync();

        if (resultadoFetch.isNew || resultadoFetch.isRollBackToEmbedded) {
          estadoOta = {
            ...estadoOta,
            descargando: false,
            progresoDescarga: 1,
            actualizacionDisponible: true,
            actualizacionPendienteRecarga: true,
            ultimaVerificacion: hora,
            mensajeEstado:
              estadoOta.autoActualizar || manual
                ? 'Actualización OTA descargada. Aplicando y renderizando ahora…'
                : 'Actualización OTA descargada. Pulsá "Aplicar ahora" para renderizarla.'
          };
          notificar();

          if (estadoOta.autoActualizar || manual) {
            operacionEnCurso = false;
            await aplicarRecargaOtaInmediata();
            return {
              aplicada: true,
              disponible: true,
              mensaje: `Actualización OTA (${nuevoId}) descargada y aplicada en vivo.`
            };
          }

          return {
            aplicada: false,
            disponible: true,
            mensaje: `Actualización OTA (${nuevoId}) lista para aplicar.`
          };
        }
      }

      // No hay una actualización más nueva en EAS que la que ya está corriendo
      estadoOta = {
        ...estadoOta,
        verificando: false,
        descargando: false,
        actualizacionDisponible: false,
        ultimaVerificacion: hora,
        mensajeEstado: infoNativa.esOta
          ? `Al día con último Update OTA (${infoNativa.idCorto}) · Canal ${infoNativa.canal} · Verificado ${hora}`
          : `Al día en EAS Update (Canal ${infoNativa.canal} · Runtime v${infoNativa.runtime}) · Verificado ${hora}`
      };
      notificar();

      if (manual) {
        emitirRecargaGlobalEnVivo();
      }

      return {
        aplicada: false,
        disponible: false,
        mensaje: manual
          ? `Ya estás en la última versión publicada en EAS Update (ID: ${infoNativa.idCorto} · Canal: ${infoNativa.canal}).`
          : estadoOta.mensajeEstado
      };
    }

    // 2) Modo Desarrollo (Expo Go) o Web: sincronizar con el backend y refrescar en vivo
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000);
    let versionRemota = VERSION_APP_LOCAL;
    try {
      const resp = await fetch(`${URL_API}/health?_t=${Date.now()}`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: ctrl.signal
      });
      if (resp.ok) {
        const json = await resp.json();
        versionRemota = json?.datos?.version || VERSION_APP_LOCAL;
      }
    } catch {
      /* ignorar si el servidor está despertando */
    } finally {
      clearTimeout(timer);
    }

    if (manual) {
      emitirRecargaGlobalEnVivo();
    }

    estadoOta = {
      ...estadoOta,
      verificando: false,
      descargando: false,
      versionServidor: versionRemota,
      ultimaVerificacion: hora,
      mensajeEstado:
        Platform.OS === 'web'
          ? `Aplicación Web sincronizada en vivo (v${versionRemota}) · Verificado ${hora}`
          : `Modo desarrollo activo (v${versionRemota}) · EAS Update opera en el APK compilado`
    };
    notificar();

    return {
      aplicada: manual,
      disponible: false,
      mensaje:
        Platform.OS === 'web'
          ? `Interfaz y datos sincronizados en vivo (v${versionRemota}).`
          : `Datos sincronizados en vivo. En el APK compilado con EAS, este botón descarga y aplica los updates de EAS automáticamente.`
    };
  } catch (error) {
    const detalle = error instanceof Error ? error.message : String(error);
    estadoOta = {
      ...estadoOta,
      verificando: false,
      descargando: false,
      ultimaVerificacion: hora,
      errorDetalle: detalle,
      mensajeEstado: `EAS Update activo (ID ${infoNativa.idCorto} · Canal ${infoNativa.canal})`
    };
    notificar();
    return {
      aplicada: false,
      disponible: false,
      mensaje: manual
        ? `Verificación completada (ID actual: ${infoNativa.idCorto}). ${detalle}`
        : estadoOta.mensajeEstado
    };
  } finally {
    operacionEnCurso = false;
  }
}

export function iniciarMotorActualizacionesOta(): void {
  if (inicializado) return;
  inicializado = true;

  void (async () => {
    const pref = await obtener(CLAVES.autoUpdateOta);
    if (pref === '0') {
      estadoOta.autoActualizar = false;
    }
    // Verificar apenas arranca la aplicación
    await verificarYAplicarActualizacionOta(false);
  })();

  // Sondeo periódico en vivo cada 25 segundos mientras la aplicación está abierta
  // para que si se publica un `eas update` con la app abierta, se detecte, descargue y renderice sola
  setInterval(() => {
    if (estadoOta.autoActualizar && Platform.OS !== 'web' && Updates.isEnabled) {
      void verificarYAplicarActualizacionOta(false);
    }
  }, 25000);

  try {
    AppState.addEventListener('change', (estadoApp) => {
      if (estadoApp === 'active') {
        void verificarYAplicarActualizacionOta(false);
      }
    });
  } catch {
    /* ignorar */
  }
}

/**
 * Componente global que se conecta al hook nativo `Updates.useUpdates()` de `expo-updates`.
 * - Sincroniza en tiempo real los eventos nativos de EAS Update (descarga en segundo plano
 *   iniciada por `ON_LOAD` o por `checkForUpdateAsync`).
 * - Cuando `isUpdatePending` pasa a `true`, ejecuta `Updates.reloadAsync()` automáticamente
 *   para que la actualización se aplique en vivo sin tener que cerrar y volver a abrir la app.
 * - Muestra un banner flotante en vivo cuando se está descargando o aplicando un update OTA.
 */
export function MonitorActualizacionesOta() {
  const { tokens } = useTema();
  const infoUpdates = Updates.useUpdates();
  const estado = useActualizacionesOta();
  const descargaIniciadaRef = useRef<string | null>(null);

  useEffect(() => {
    const running = infoUpdates.currentlyRunning;
    const idActual = running?.updateId ?? Updates.updateId ?? null;
    const idCorto = idActual ? idActual.slice(0, 8) : 'base-apk';
    const canal = running?.channel || Updates.channel || estadoOta.canal || 'preview';
    const runtime = running?.runtimeVersion || Updates.runtimeVersion || VERSION_APP_LOCAL;
    const esOta = Boolean(Updates.isEnabled && !running?.isEmbeddedLaunch && idActual);
    const fecha = formatearFechaCorta(running?.createdAt ?? Updates.createdAt);

    const hayDisponible = Boolean(infoUpdates.isUpdateAvailable);
    const hayPendiente = Boolean(infoUpdates.isUpdatePending);
    const verificando = Boolean(infoUpdates.isChecking) || estadoOta.verificando;
    const descargando = Boolean(infoUpdates.isDownloading) || estadoOta.descargando;
    const progreso =
      typeof infoUpdates.downloadProgress === 'number' ? infoUpdates.downloadProgress : 0;

    let nuevoMensaje = estadoOta.mensajeEstado;
    if (hayPendiente) {
      nuevoMensaje = estadoOta.autoActualizar
        ? '¡Actualización OTA descargada! Aplicando en vivo…'
        : '¡Nueva actualización OTA descargada y lista para aplicar!';
    } else if (descargando) {
      const pct = Math.round(progreso * 100);
      nuevoMensaje = `Descargando actualización OTA desde EAS${pct > 0 ? ` (${pct}%)` : ''}…`;
    } else if (hayDisponible) {
      nuevoMensaje = 'Nueva actualización OTA detectada en EAS…';
    } else if (esOta && !estadoOta.ultimaVerificacion) {
      nuevoMensaje = `Update OTA activo (${idCorto}) · Canal ${canal}`;
    }

    estadoOta = {
      ...estadoOta,
      updateId: idActual,
      updateIdCorto: idCorto,
      canal,
      runtimeVersion: runtime,
      fechaUpdate: fecha,
      esBundleOtaDescargado: esOta,
      otaNativoHabilitado: Boolean(Updates.isEnabled && Platform.OS !== 'web'),
      verificando,
      descargando,
      progresoDescarga: progreso,
      actualizacionDisponible: hayDisponible || hayPendiente,
      actualizacionPendienteRecarga: hayPendiente,
      mensajeEstado: nuevoMensaje,
      errorDetalle:
        infoUpdates.checkError?.message ||
        infoUpdates.downloadError?.message ||
        estadoOta.errorDetalle
    };
    notificar();

    // Si el motor nativo detectó una actualización disponible pero aún no inició su descarga, descargarla
    if (
      Platform.OS !== 'web' &&
      Updates.isEnabled &&
      hayDisponible &&
      !hayPendiente &&
      !infoUpdates.isDownloading
    ) {
      const idDisp = infoUpdates.availableUpdate?.updateId ?? 'disp';
      if (descargaIniciadaRef.current !== idDisp) {
        descargaIniciadaRef.current = idDisp;
        void Updates.fetchUpdateAsync().catch(() => {});
      }
    }

    // Si la actualización ya terminó de descargarse (por ON_LOAD o en vivo), aplicarla inmediatamente sin cerrar la app
    if (Platform.OS !== 'web' && Updates.isEnabled && hayPendiente && estadoOta.autoActualizar) {
      const timer = setTimeout(() => {
        void aplicarRecargaOtaInmediata();
      }, 400);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [
    infoUpdates.currentlyRunning?.updateId,
    infoUpdates.currentlyRunning?.channel,
    infoUpdates.currentlyRunning?.isEmbeddedLaunch,
    infoUpdates.isUpdateAvailable,
    infoUpdates.isUpdatePending,
    infoUpdates.isChecking,
    infoUpdates.isDownloading,
    infoUpdates.downloadProgress,
    infoUpdates.availableUpdate?.updateId,
    infoUpdates.checkError,
    infoUpdates.downloadError
  ]);

  const mostrarBanner =
    estado.descargando || estado.actualizacionPendienteRecarga || estado.actualizacionDisponible;

  if (!mostrarBanner) return null;

  return (
    <View
      style={{
        backgroundColor: tokens.superficie,
        borderColor: tokens.primario,
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 10
      }}
      className="mx-3 mt-2 flex-row items-center justify-between gap-3 rounded-2xl border-2 px-3.5 py-2.5"
    >
      <View className="min-w-0 flex-1 flex-row items-center gap-2.5">
        {estado.descargando ? (
          <ActivityIndicator size="small" color={tokens.primario} />
        ) : (
          <Ionicons name="cloud-download-outline" size={20} color={tokens.primario} />
        )}
        <View className="min-w-0 flex-1">
          <Text
            style={{ color: tokens.texto }}
            className="text-xs font-bold text-texto"
            numberOfLines={1}
          >
            {estado.actualizacionPendienteRecarga
              ? '¡Nueva versión OTA descargada!'
              : 'Actualizando aplicación en vivo (OTA)…'}
          </Text>
          <Text
            style={{ color: tokens.textoSuave }}
            className="text-[11px] text-texto-suave"
            numberOfLines={1}
          >
            {estado.mensajeEstado}
          </Text>
        </View>
      </View>

      {estado.actualizacionPendienteRecarga && (
        <Pressable
          onPress={() => void aplicarRecargaOtaInmediata()}
          style={{ backgroundColor: tokens.primario }}
          className="rounded-xl px-3 py-1.5"
        >
          <Text className="text-xs font-bold text-white">Aplicar ahora</Text>
        </Pressable>
      )}
    </View>
  );
}

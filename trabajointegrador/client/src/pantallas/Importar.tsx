/**
 * @file Módulo de importación del listado de precios desde Excel.
 *       Permite seleccionar cualquier archivo Excel (.xlsx) disponible en el servidor
 *       o subir uno específico desde el dispositivo, previsualizar su impacto en detalle
 *       y aplicar la sincronización idempotente por lotes (UPSERT) en TiDB/MySQL.
 * @module client/src/pantallas/Importar
 */

import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View
} from 'react-native';
import { File as ExpoFile } from 'expo-file-system';

import { usePopUps } from '../componentes/popups/PopUpsProvider';
import { Boton, BotonIcono } from '../componentes/ui/Boton';
import { Insignia } from '../componentes/ui/Insignia';
import { EncabezadoTarjeta, Tarjeta } from '../componentes/ui/Tarjeta';
import { peticion } from '../servicios/api';
import { useTema } from '../tema/TemaProvider';
import { cn } from '../utils/cn';

interface ArchivoExcelDisponible {
  id: string;
  nombre: string;
  ubicacion: string;
  tamanoBytes: number;
  modificadoEn: string;
  esPredeterminado: boolean;
}

interface ProductoMuestra {
  fila: number;
  codigo: string;
  categoriaNombre: string | null;
  medidas: string;
  precioLista: number | null;
  stockInicial: number;
  estado: 'nuevo' | 'actualizado' | 'sin_cambios';
}

interface PreviewImportacion {
  meta: {
    archivo: string;
    hoja: string;
    hojas?: string[];
    totalFilas: number;
    productosValidos: number;
    descartados: number;
    advertencias: number;
    fechaProceso?: string;
  };
  categorias: {
    nuevas: string[];
    existentes: string[];
  };
  productos: {
    total: number;
    nuevos: number;
    actualizados: number;
    sinCambios: number;
  };
  muestraProductos?: ProductoMuestra[];
  equivalencias: number;
  cambiosDePrecio: Array<{ codigo: string; anterior: number | null; nuevo: number | null }>;
  descartes: Array<{ fila: number; codigo: string; motivo: string }>;
  advertencias: Array<{ fila: number; motivo: string }>;
}

interface ResumenAplicado {
  categorias: number;
  productosInsertados: number;
  productosActualizados: number;
  productosSinCambios: number;
  equivalencias: number;
  preciosActualizados: number;
  archivo?: string;
  hoja?: string;
  logGenerado?: string | null;
}

function formatearTamano(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatearFecha(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return iso;
  }
}

function formatearPrecio(valor: number | null | undefined): string {
  if (valor === null || valor === undefined) return '—';
  return `$${Number(valor).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Pantalla de importación de Excel para el Administrador. */
export function Importar() {
  const { tokens } = useTema();
  const { avisar, confirmar } = usePopUps();

  const [archivos, setArchivos] = useState<ArchivoExcelDisponible[]>([]);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<string>('');
  const [hojaSeleccionada, setHojaSeleccionada] = useState<string>('');

  const [preview, setPreview] = useState<PreviewImportacion | null>(null);
  const [resultado, setResultado] = useState<ResumenAplicado | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const [cargandoArchivos, setCargandoArchivos] = useState(false);
  const [subiendoArchivo, setSubiendoArchivo] = useState(false);
  const [cargandoPreview, setCargandoPreview] = useState(false);
  const [aplicando, setAplicando] = useState(false);

  const cargarArchivos = useCallback(async () => {
    setCargandoArchivos(true);
    try {
      const resp = await peticion<{
        predeterminado: string;
        archivos: ArchivoExcelDisponible[];
      }>('/importacion/archivos');
      setArchivos(resp.archivos ?? []);
      if (!archivoSeleccionado && resp.predeterminado) {
        setArchivoSeleccionado(resp.predeterminado);
      }
    } catch {
      /* si el endpoint falla, continuar silenciosamente */
    } finally {
      setCargandoArchivos(false);
    }
  }, [archivoSeleccionado]);

  const cargarLogs = useCallback(async () => {
    try {
      const lista = await peticion<string[]>('/importacion/logs');
      setLogs(lista ?? []);
    } catch {
      /* silencioso */
    }
  }, []);

  useEffect(() => {
    void cargarArchivos();
    void cargarLogs();
  }, [cargarArchivos, cargarLogs]);

  const ejecutarPreview = async (archivoAUsar?: string, hojaAUsar?: string) => {
    const targetArchivo = archivoAUsar ?? archivoSeleccionado;
    const targetHoja = hojaAUsar ?? hojaSeleccionada;

    setCargandoPreview(true);
    setResultado(null);
    try {
      const datos = await peticion<PreviewImportacion>('/importacion/preview', {
        metodo: 'POST',
        cuerpo: {
          archivo: targetArchivo || undefined,
          hoja: targetHoja || undefined
        }
      });
      setPreview(datos);
      if (datos.meta?.hoja) {
        setHojaSeleccionada(datos.meta.hoja);
      }
      avisar(`Vista previa generada para ${datos.meta.archivo} (${datos.productos.total} productos).`, 'exito');
    } catch (error) {
      avisar(
        error instanceof Error ? error.message : 'No se pudo previsualizar el archivo Excel seleccionado.',
        'peligro'
      );
    } finally {
      setCargandoPreview(false);
    }
  };

  const enviarArchivoSubido = async (nombre: string, contenidoBase64: string) => {
    setSubiendoArchivo(true);
    setResultado(null);
    try {
      const resp = await peticion<{
        archivo: ArchivoExcelDisponible;
        preview: PreviewImportacion;
      }>('/importacion/subir', {
        metodo: 'POST',
        cuerpo: { nombre, contenidoBase64 }
      });
      setArchivoSeleccionado(resp.archivo.id);
      setPreview(resp.preview);
      if (resp.preview.meta?.hoja) {
        setHojaSeleccionada(resp.preview.meta.hoja);
      }
      avisar(`Archivo "${resp.archivo.nombre}" subido y analizado con éxito.`, 'exito');
      await cargarArchivos();
    } catch (error) {
      avisar(
        error instanceof Error ? error.message : 'Error al procesar el archivo Excel subido.',
        'peligro'
      );
    } finally {
      setSubiendoArchivo(false);
    }
  };

  const seleccionarYSubirArchivo = async () => {
    try {
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept =
          '.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        input.onchange = (e: any) => {
          const file = e.target?.files?.[0];
          if (!file) return;
          const lector = new FileReader();
          lector.onload = async () => {
            const raw = lector.result as string;
            const b64 = raw.includes(',') ? raw.split(',')[1] : raw;
            await enviarArchivoSubido(file.name, b64);
          };
          lector.onerror = () => {
            avisar('No se pudo leer el archivo seleccionado.', 'peligro');
          };
          lector.readAsDataURL(file);
        };
        input.click();
        return;
      }

      // Plataforma nativa (Android / iOS)
      try {
        const eleccion = await ExpoFile.pickFileAsync({
          mimeTypes: [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            '*/*'
          ]
        });
        if (!eleccion.canceled && eleccion.result) {
          const b64 = await eleccion.result.base64();
          await enviarArchivoSubido(eleccion.result.name, b64);
        }
      } catch (err) {
        avisar(
          err instanceof Error
            ? err.message
            : 'No se pudo abrir el selector de archivos del dispositivo.',
          'peligro'
        );
      }
    } catch (error) {
      avisar(
        error instanceof Error ? error.message : 'Error al seleccionar archivo.',
        'peligro'
      );
    }
  };

  const ejecutarAplicar = async () => {
    const archivoNombre = preview?.meta.archivo || archivoSeleccionado || 'el archivo Excel seleccionado';
    const totalProd = preview?.productos.total ?? 0;

    const ok = await confirmar({
      titulo: 'Confirmar Importación a Base de Datos',
      mensaje: `¿Estás seguro de sincronizar la base de datos con "${archivoNombre}" (${totalProd} productos analizados)? Se aplicarán las inserciones y actualizaciones correspondientes.`
    });
    if (!ok) return;

    setAplicando(true);
    try {
      const res = await peticion<ResumenAplicado>('/importacion/aplicar', {
        metodo: 'POST',
        cuerpo: {
          archivo: archivoSeleccionado || undefined,
          hoja: hojaSeleccionada || undefined
        }
      });
      setResultado(res);
      avisar('¡Importación aplicada y sincronizada con éxito!', 'exito');
      await cargarLogs();
    } catch (error) {
      avisar(
        error instanceof Error ? error.message : 'Falló la aplicación de la importación.',
        'peligro'
      );
    } finally {
      setAplicando(false);
    }
  };

  const archivoActual =
    archivos.find((a) => a.id === archivoSeleccionado || a.nombre === archivoSeleccionado) ??
    archivos.find((a) => a.esPredeterminado) ??
    null;

  return (
    <ScrollView className="flex-1 bg-fondo" contentContainerClassName="gap-4 p-5 pb-16">
      {/* Encabezado */}
      <View className="flex-row items-center gap-3">
        <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primario/12">
          <Ionicons name="cloud-upload-outline" size={24} color={tokens.primario} />
        </View>
        <View className="flex-1">
          <Text className="text-xl font-bold text-texto">Importar Lista de Precios Excel</Text>
          <Text className="text-sm text-texto-suave">
            Seleccioná o subí un archivo Excel (.xlsx), previsualizá el impacto y confirmá la sincronización
          </Text>
        </View>
      </View>

      {/* SELECCIÓN DE EXCEL ESPECÍFICO */}
      <Tarjeta clase="gap-4">
        <EncabezadoTarjeta
          titulo="1. Seleccionar Archivo Excel (.xlsx)"
          descripcion="Elegí un archivo existente en el servidor o subí una planilla específica desde tu equipo."
          icono="document-attach-outline"
        />

        {/* Botón para subir un archivo nuevo desde el dispositivo */}
        <View className="flex-row flex-wrap items-center gap-3">
          <Boton
            titulo={subiendoArchivo ? 'Cargando archivo...' : 'Elegir y Subir Excel (.xlsx)'}
            icono="cloud-upload-outline"
            variante="primario"
            cargando={subiendoArchivo}
            onPress={() => void seleccionarYSubirArchivo()}
          />
          <BotonIcono
            icono="refresh-outline"
            variante="fantasma"
            alPresionar={() => void cargarArchivos()}
            etiquetaAccesible="Refrescar lista de archivos"
          />
          {cargandoArchivos && (
            <ActivityIndicator size="small" color={tokens.primario} />
          )}
        </View>

        {/* Lista de archivos disponibles */}
        <View className="gap-2">
          <Text className="text-xs font-bold uppercase tracking-wider text-texto-suave">
            Archivos disponibles en el sistema ({archivos.length})
          </Text>

          {archivos.length === 0 && !cargandoArchivos ? (
            <View className="rounded-xl border border-borde bg-superficie-alt p-3">
              <Text className="text-xs text-texto-suave">
                No se encontraron archivos en imports/. Usá el botón "Elegir y Subir Excel" para cargar uno.
              </Text>
            </View>
          ) : (
            archivos.map((arch) => {
              const estaSeleccionado =
                archivoSeleccionado === arch.id ||
                archivoSeleccionado === arch.nombre ||
                (!archivoSeleccionado && arch.esPredeterminado);

              return (
                <Pressable
                  key={arch.id}
                  onPress={() => {
                    setArchivoSeleccionado(arch.id);
                    setPreview(null);
                    setResultado(null);
                    void ejecutarPreview(arch.id);
                  }}
                  className={cn(
                    'flex-row items-center justify-between rounded-xl border p-3 transition-colors',
                    estaSeleccionado
                      ? 'border-primario bg-primario/10'
                      : 'border-borde bg-superficie-alt hover:bg-superficie'
                  )}
                >
                  <View className="flex-1 pr-3">
                    <View className="flex-row items-center gap-2">
                      <Ionicons
                        name={estaSeleccionado ? 'radio-button-on' : 'radio-button-off'}
                        size={18}
                        color={estaSeleccionado ? tokens.primario : tokens.textoSuave}
                      />
                      <Text
                        className={cn(
                          'text-sm font-semibold',
                          estaSeleccionado ? 'text-primario font-bold' : 'text-texto'
                        )}
                        numberOfLines={1}
                      >
                        {arch.nombre}
                      </Text>
                      {arch.esPredeterminado && (
                        <Insignia texto="Oficial Vigente" tono="info" />
                      )}
                    </View>
                    <Text className="mt-1 pl-6 text-xs text-texto-suave">
                      {arch.ubicacion} • {formatearTamano(arch.tamanoBytes)} • Modificado: {formatearFecha(arch.modificadoEn)}
                    </Text>
                  </View>

                  <Ionicons
                    name="chevron-forward-outline"
                    size={16}
                    color={estaSeleccionado ? tokens.primario : tokens.textoSuave}
                  />
                </Pressable>
              );
            })
          )}
        </View>

        {/* Archivo actualmente activo */}
        {archivoActual && (
          <View className="rounded-xl border border-primario/30 bg-primario/5 p-3 flex-row items-center justify-between">
            <View className="flex-1 pr-2">
              <Text className="text-xs font-bold text-primario">
                Archivo activo para procesar:
              </Text>
              <Text className="text-xs text-texto font-medium" numberOfLines={1}>
                {archivoActual.nombre}
              </Text>
            </View>
            {hojaSeleccionada ? (
              <Insignia texto={`Hoja: "${hojaSeleccionada}"`} tono="neutro" />
            ) : null}
          </View>
        )}
      </Tarjeta>

      {/* ACCIONES: PREVISUALIZAR Y APLICAR */}
      <Tarjeta clase="gap-4">
        <EncabezadoTarjeta
          titulo="2. Previsualizar y Aplicar"
          descripcion="Generá el diagnóstico de cambios antes de escribir y luego aplicá la sincronización."
          icono="sync-outline"
        />

        <View className="flex-row flex-wrap gap-3">
          <Boton
            titulo="Previsualizar Cambios"
            icono="eye-outline"
            variante="secundario"
            cargando={cargandoPreview}
            onPress={() => void ejecutarPreview()}
          />

          <Boton
            titulo={aplicando ? 'Aplicando importación...' : 'Aplicar Importación'}
            icono="checkmark-done-outline"
            variante="primario"
            deshabilitado={!preview || cargandoPreview}
            cargando={aplicando}
            onPress={() => void ejecutarAplicar()}
          />
        </View>

        {!preview && (
          <Text className="text-xs text-texto-suave">
            💡 Tocá "Previsualizar Cambios" para inspeccionar las filas, precios nuevos y categorías antes de aplicar.
          </Text>
        )}
      </Tarjeta>

      {/* RESULTADO DE LA APLICACIÓN */}
      {resultado && (
        <Tarjeta clase="gap-3 border-exito">
          <EncabezadoTarjeta
            titulo="¡Importación Aplicada Exitosamente!"
            descripcion={`Sincronizado con "${resultado.archivo || 'planilla'}" en TiDB Cloud`}
            icono="checkmark-circle-outline"
          />

          <View className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <View className="rounded-xl border border-borde bg-superficie-alt p-3">
              <Text className="text-xs text-texto-suave">Categorías procesadas</Text>
              <Text className="text-lg font-bold text-texto">{resultado.categorias}</Text>
            </View>
            <View className="rounded-xl border border-exito/30 bg-exito/10 p-3">
              <Text className="text-xs text-exito font-medium">Productos nuevos</Text>
              <Text className="text-lg font-bold text-exito">+{resultado.productosInsertados}</Text>
            </View>
            <View className="rounded-xl border border-info/30 bg-info/10 p-3">
              <Text className="text-xs text-info font-medium">Productos actualizados</Text>
              <Text className="text-lg font-bold text-info">{resultado.productosActualizados}</Text>
            </View>
            <View className="rounded-xl border border-borde bg-superficie-alt p-3">
              <Text className="text-xs text-texto-suave">Sin cambios</Text>
              <Text className="text-lg font-bold text-texto">{resultado.productosSinCambios}</Text>
            </View>
            <View className="rounded-xl border border-primario/30 bg-primario/10 p-3">
              <Text className="text-xs text-primario font-medium">Equivalencias cargadas</Text>
              <Text className="text-lg font-bold text-primario">{resultado.equivalencias}</Text>
            </View>
            <View className="rounded-xl border border-borde bg-superficie-alt p-3">
              <Text className="text-xs text-texto-suave">Precios con historial</Text>
              <Text className="text-lg font-bold text-texto">{resultado.preciosActualizados}</Text>
            </View>
          </View>

          {resultado.logGenerado && (
            <View className="mt-1 flex-row items-center gap-2 rounded-lg bg-superficie-alt p-2.5">
              <Ionicons name="document-text-outline" size={16} color={tokens.exito} />
              <Text className="text-xs text-texto">
                Registro de auditoría guardado: <Text className="font-bold">{resultado.logGenerado}</Text>
              </Text>
            </View>
          )}
        </Tarjeta>
      )}

      {/* VISTA PREVIA DETALLADA DEL IMPACTO */}
      {preview && (
        <Tarjeta clase="gap-4">
          <EncabezadoTarjeta
            titulo="Vista Previa del Impacto"
            descripcion={`Archivo: ${preview.meta.archivo} • Hoja "${preview.meta.hoja}" (${preview.meta.totalFilas} filas totales)`}
            icono="analytics-outline"
          />

          {/* Tarjetas de métricas de impacto */}
          <View className="flex-row flex-wrap gap-2">
            <Insignia texto={`Total válidos: ${preview.productos.total}`} tono="primario" />
            <Insignia texto={`Nuevos: ${preview.productos.nuevos}`} tono="exito" />
            <Insignia texto={`Actualizados: ${preview.productos.actualizados}`} tono="info" />
            <Insignia texto={`Sin cambios: ${preview.productos.sinCambios}`} tono="neutro" />
            <Insignia texto={`Equivalencias: ${preview.equivalencias}`} tono="primario" />
            {preview.categorias.nuevas.length > 0 && (
              <Insignia texto={`+${preview.categorias.nuevas.length} Categorías nuevas`} tono="exito" />
            )}
          </View>

          {/* Cambios de precio detectados */}
          {preview.cambiosDePrecio.length > 0 && (
            <View className="gap-2 rounded-xl border border-info/30 bg-info/5 p-3.5">
              <View className="flex-row items-center justify-between">
                <Text className="text-xs font-bold text-info">
                  Variaciones de Precio Detectadas ({preview.cambiosDePrecio.length})
                </Text>
                <Text className="text-[11px] text-texto-suave">Mostrando primeras 8</Text>
              </View>
              <View className="gap-1.5">
                {preview.cambiosDePrecio.slice(0, 8).map((cambio, idx) => {
                  const dif = (cambio.nuevo ?? 0) - (cambio.anterior ?? 0);
                  const subio = dif > 0;
                  return (
                    <View
                      key={idx}
                      className="flex-row items-center justify-between rounded-lg bg-superficie px-3 py-1.5"
                    >
                      <Text className="font-mono text-xs font-bold text-texto">
                        {cambio.codigo}
                      </Text>
                      <View className="flex-row items-center gap-2">
                        <Text className="text-xs text-texto-suave line-through">
                          {formatearPrecio(cambio.anterior)}
                        </Text>
                        <Ionicons name="arrow-forward-outline" size={12} color={tokens.textoSuave} />
                        <Text className="text-xs font-bold text-texto">
                          {formatearPrecio(cambio.nuevo)}
                        </Text>
                        <Text className={cn('text-xs font-bold', subio ? 'text-peligro' : 'text-exito')}>
                          ({subio ? '+' : ''}{formatearPrecio(dif)})
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Muestra de productos analizados */}
          {preview.muestraProductos && preview.muestraProductos.length > 0 && (
            <View className="gap-2">
              <View className="flex-row items-center justify-between">
                <Text className="text-xs font-bold uppercase tracking-wider text-texto-suave">
                  Muestra de productos analizados ({preview.muestraProductos.length} de {preview.productos.total})
                </Text>
                <Text className="text-[11px] text-texto-suave">Código / Medidas / Precio</Text>
              </View>

              <View className="overflow-hidden rounded-xl border border-borde">
                {preview.muestraProductos.map((prod, index) => {
                  const tono =
                    prod.estado === 'nuevo'
                      ? 'exito'
                      : prod.estado === 'actualizado'
                      ? 'info'
                      : 'neutro';

                  const textoEstado =
                    prod.estado === 'nuevo'
                      ? 'Nuevo'
                      : prod.estado === 'actualizado'
                      ? 'Actualiza'
                      : 'Sin cambios';

                  return (
                    <View
                      key={prod.codigo}
                      className={cn(
                        'flex-row items-center justify-between p-2.5 px-3',
                        index % 2 === 0 ? 'bg-superficie' : 'bg-superficie-alt',
                        index > 0 && 'border-t border-borde'
                      )}
                    >
                      <View className="flex-1 pr-2">
                        <View className="flex-row items-center gap-2">
                          <Text className="font-mono text-xs font-bold text-texto">
                            {prod.codigo}
                          </Text>
                          <Insignia texto={textoEstado} tono={tono} />
                        </View>
                        <Text className="text-[11px] text-texto-suave" numberOfLines={1}>
                          {prod.categoriaNombre || 'Sin categoría'} • Medidas: {prod.medidas}
                        </Text>
                      </View>

                      <View className="items-end">
                        <Text className="font-semibold text-xs text-texto">
                          {formatearPrecio(prod.precioLista)}
                        </Text>
                        <Text className="text-[10px] text-texto-suave">
                          Stock: {prod.stockInicial} u.
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Advertencias y descartes */}
          {preview.descartes.length > 0 && (
            <View className="rounded-xl border border-borde bg-superficie-alt p-3">
              <Text className="mb-1 text-xs font-bold text-advertencia">
                Filas descartadas ({preview.descartes.length}):
              </Text>
              {preview.descartes.map((d, i) => (
                <Text key={i} className="text-xs text-texto-suave">
                  • Fila {d.fila} ({d.codigo}): {d.motivo}
                </Text>
              ))}
            </View>
          )}

          {/* Botón rápido para aplicar tras ver la vista previa */}
          <View className="pt-2">
            <Boton
              titulo="Confirmar y Aplicar Importación Ahora"
              icono="checkmark-done-outline"
              variante="primario"
              cargando={aplicando}
              onPress={() => void ejecutarAplicar()}
            />
          </View>
        </Tarjeta>
      )}

      {/* BITÁCORA DE IMPORTACIONES */}
      <Tarjeta>
        <EncabezadoTarjeta
          titulo="Bitácora de Importaciones"
          descripcion="Archivos de registro histórico generados en imports/logs/"
          icono="folder-open-outline"
        />
        <View className="gap-1.5">
          {logs.length === 0 ? (
            <Text className="text-xs text-texto-suave">No hay registros de importación aún.</Text>
          ) : (
            logs.map((nombre) => (
              <View
                key={nombre}
                className="flex-row items-center gap-2 rounded-lg bg-superficie-alt px-3 py-2"
              >
                <Ionicons name="document-text-outline" size={16} color={tokens.primario} />
                <Text className="text-xs font-medium text-texto">{nombre}</Text>
              </View>
            ))
          )}
        </View>
      </Tarjeta>
    </ScrollView>
  );
}

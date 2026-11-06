/**
 * @file Módulo de Depósito: control del inventario físico existente en el depósito.
 *       Muestra exclusivamente los productos con existencias reales (stock > 0),
 *       métricas de unidades almacenadas, artículos bajo stock mínimo, arribos
 *       esperados y registro rápido de ingresos, egresos y ajustes de recuento físico.
 *       Sección exclusiva para Encargado de Depósito y Administrador.
 * @module client/src/pantallas/Deposito
 */

import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View
} from 'react-native';

import { usePopUps } from '../componentes/popups/PopUpsProvider';
import { Boton, BotonIcono } from '../componentes/ui/Boton';
import { Entrada } from '../componentes/ui/Entrada';
import { Insignia, tonoDeStock } from '../componentes/ui/Insignia';
import { EncabezadoTarjeta, Tarjeta } from '../componentes/ui/Tarjeta';
import { useSeleccionar } from '../estado/store';
import { peticion, peticionConMeta } from '../servicios/api';
import { useTema } from '../tema/TemaProvider';
import { cn } from '../utils/cn';

interface ArticuloDeposito {
  id: number;
  codigo: string;
  categoriaId: number | null;
  categoriaNombre: string;
  stock: number;
  stockMinimo: number;
  proximoEmbarque: number;
  proximoIngreso: boolean;
  ejeTexto: string | null;
  alojTexto: string | null;
  altTexto: string | null;
  giro: string | null;
  uxb: number | null;
  observaciones: string | null;
  precioLista: number | null;
  actualizadoEn: string;
}

interface ResumenDeposito {
  totalUnidades: number;
  totalArticulosConStock: number;
  articulosCriticos: number;
  unidadesEmbarque: number;
  valorEstimado: number;
}

function formatearPrecio(valor: number | null | undefined): string {
  if (valor === null || valor === undefined) return '—';
  return `$${Number(valor).toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

export function Deposito() {
  const { tokens, esOscuro } = useTema();
  const { avisar } = usePopUps();
  const usuario = useSeleccionar((estado) => estado.sesion.usuario);

  const esAutorizado =
    usuario?.rol.codigo === 'admin' || usuario?.rol.codigo === 'deposito';

  const [resumen, setResumen] = useState<ResumenDeposito>({
    totalUnidades: 0,
    totalArticulosConStock: 0,
    articulosCriticos: 0,
    unidadesEmbarque: 0,
    valorEstimado: 0
  });

  const [articulos, setArticulos] = useState<ArticuloDeposito[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'critico' | 'embarque'>('todos');

  // Modal para movimiento rápido de depósito
  const [modalAbierto, setModalAbierto] = useState(false);
  const [articuloSeleccionado, setArticuloSeleccionado] = useState<ArticuloDeposito | null>(null);
  const [tipoMovimiento, setTipoMovimiento] = useState<'ingreso' | 'egreso' | 'ajuste'>('ingreso');
  const [cantidad, setCantidad] = useState('');
  const [motivo, setMotivo] = useState('');
  const [referencia, setReferencia] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cargarDatos = useCallback(
    async (silencioso = false) => {
      if (!esAutorizado) return;
      if (!silencioso) setCargando(true);
      else setRefrescando(true);

      try {
        const respuesta = await peticion<{
          resumen: ResumenDeposito;
          articulos: ArticuloDeposito[];
        }>('/stock/deposito', {
          consulta: {
            q: busqueda.trim() || undefined,
            estado: filtroEstado !== 'todos' ? filtroEstado : undefined,
            limite: 100
          }
        });

        setResumen(
          respuesta.resumen ?? {
            totalUnidades: 0,
            totalArticulosConStock: 0,
            articulosCriticos: 0,
            unidadesEmbarque: 0,
            valorEstimado: 0
          }
        );
        setArticulos(respuesta.articulos ?? []);
      } catch (error) {
        avisar(
          error instanceof Error
            ? error.message
            : 'No se pudo cargar el inventario del depósito.',
          'peligro'
        );
      } finally {
        setCargando(false);
        setRefrescando(false);
      }
    },
    [esAutorizado, busqueda, filtroEstado, avisar]
  );

  useEffect(() => {
    const temporizador = setTimeout(() => {
      void cargarDatos();
    }, 250);
    return () => clearTimeout(temporizador);
  }, [cargarDatos]);

  const abrirModalMovimiento = (articulo: ArticuloDeposito, tipo: 'ingreso' | 'egreso' | 'ajuste' = 'ingreso') => {
    setArticuloSeleccionado(articulo);
    setTipoMovimiento(tipo);
    setCantidad(tipo === 'ajuste' ? String(articulo.stock) : '');
    setMotivo('');
    setReferencia('');
    setModalAbierto(true);
  };

  const confirmarMovimiento = async () => {
    if (!articuloSeleccionado) return;
    const cantNum = Number.parseInt(cantidad, 10);
    if (!Number.isFinite(cantNum) || (tipoMovimiento === 'ajuste' ? cantNum < 0 : cantNum <= 0)) {
      avisar('Ingresá una cantidad válida.', 'advertencia');
      return;
    }

    if (tipoMovimiento === 'egreso' && cantNum > articuloSeleccionado.stock) {
      avisar(
        `Stock insuficiente en depósito: disponible ${articuloSeleccionado.stock} u.`,
        'advertencia'
      );
      return;
    }

    setGuardando(true);
    try {
      await peticion('/stock/movimientos', {
        metodo: 'POST',
        cuerpo: {
          producto_id: articuloSeleccionado.id,
          tipo: tipoMovimiento,
          cantidad: cantNum,
          motivo: motivo.trim() || undefined,
          referencia: referencia.trim() || undefined
        }
      });

      avisar(
        `Movimiento registrado correctamente para ${articuloSeleccionado.codigo}.`,
        'exito'
      );
      setModalAbierto(false);
      await cargarDatos(true);
    } catch (error) {
      avisar(
        error instanceof Error ? error.message : 'No se pudo registrar el movimiento.',
        'peligro'
      );
    } finally {
      setGuardando(false);
    }
  };

  if (!esAutorizado) {
    return (
      <View className="flex-1 items-center justify-center p-6 bg-fondo">
        <Ionicons name="lock-closed-outline" size={48} color={tokens.peligro} />
        <Text className="mt-4 text-lg font-bold text-texto text-center">
          Acceso Restringido a Depósito
        </Text>
        <Text className="mt-2 text-sm text-texto-suave text-center">
          Esta sección está disponible únicamente para el Encargado de Depósito y el Administrador.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-fondo"
      contentContainerClassName="gap-4 p-5 pb-16"
      refreshControl={
        <RefreshControl
          refreshing={refrescando}
          onRefresh={() => void cargarDatos(true)}
          tintColor={tokens.primario}
        />
      }
    >
      {/* Encabezado de la Sección */}
      <View className="flex-row items-center gap-3">
        <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primario/12">
          <Ionicons name="file-tray-stacked-outline" size={24} color={tokens.primario} />
        </View>
        <View className="flex-1">
          <Text className="text-xl font-bold text-texto">Depósito de Mercadería</Text>
          <Text className="text-sm text-texto-suave">
            Control físico de inventario, existencias reales y ajustes para el Encargado de Depósito
          </Text>
        </View>
      </View>

      {/* Tarjetas de Indicadores Clave del Depósito */}
      <View className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <View className="rounded-2xl border border-primario/30 bg-primario/10 p-3.5">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-semibold text-primario">Unidades en Depósito</Text>
            <Ionicons name="cube-outline" size={16} color={tokens.primario} />
          </View>
          <Text className="mt-1 text-2xl font-bold text-primario">
            {resumen.totalUnidades.toLocaleString('es-AR')}
          </Text>
          <Text className="text-[11px] text-texto-suave">
            en {resumen.totalArticulosConStock} artículos
          </Text>
        </View>

        <View className="rounded-2xl border border-borde bg-superficie-alt p-3.5">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-semibold text-texto-suave">Artículos con Stock</Text>
            <Ionicons name="pricetags-outline" size={16} color={tokens.textoSuave} />
          </View>
          <Text className="mt-1 text-2xl font-bold text-texto">
            {resumen.totalArticulosConStock}
          </Text>
          <Text className="text-[11px] text-texto-suave">códigos disponibles</Text>
        </View>

        <View
          className={cn(
            'rounded-2xl border p-3.5',
            resumen.articulosCriticos > 0
              ? 'border-peligro/30 bg-peligro/10'
              : 'border-borde bg-superficie-alt'
          )}
        >
          <View className="flex-row items-center justify-between">
            <Text
              className={cn(
                'text-xs font-semibold',
                resumen.articulosCriticos > 0 ? 'text-peligro' : 'text-texto-suave'
              )}
            >
              Stock Crítico / Bajo
            </Text>
            <Ionicons
              name="alert-circle-outline"
              size={16}
              color={resumen.articulosCriticos > 0 ? tokens.peligro : tokens.textoSuave}
            />
          </View>
          <Text
            className={cn(
              'mt-1 text-2xl font-bold',
              resumen.articulosCriticos > 0 ? 'text-peligro' : 'text-texto'
            )}
          >
            {resumen.articulosCriticos}
          </Text>
          <Text className="text-[11px] text-texto-suave">por debajo del mínimo</Text>
        </View>

        <View className="rounded-2xl border border-info/30 bg-info/10 p-3.5">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-semibold text-info">Próximos Arribos</Text>
            <Ionicons name="boat-outline" size={16} color={tokens.info} />
          </View>
          <Text className="mt-1 text-2xl font-bold text-info">
            {resumen.unidadesEmbarque.toLocaleString('es-AR')} u.
          </Text>
          <Text className="text-[11px] text-texto-suave">en embarque de fábrica</Text>
        </View>
      </View>

      {/* Barra de Filtros y Búsqueda */}
      <Tarjeta clase="gap-3">
        <Entrada
          etiqueta="Buscar en depósito"
          icono="search-outline"
          placeholder="Código, aplicación o medidas (ej. 12 22 7, CORONA)..."
          value={busqueda}
          onChangeText={setBusqueda}
        />

        <View className="flex-row flex-wrap gap-2 pt-1">
          <Pressable
            onPress={() => setFiltroEstado('todos')}
            className={cn(
              'rounded-xl border px-3.5 py-1.5',
              filtroEstado === 'todos'
                ? 'border-primario bg-primario'
                : 'border-borde bg-superficie-alt'
            )}
          >
            <Text
              className={cn(
                'text-xs font-bold',
                filtroEstado === 'todos'
                  ? esOscuro
                    ? 'text-fondo'
                    : 'text-white'
                  : 'text-texto'
              )}
            >
              Todos con Stock ({resumen.totalArticulosConStock})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setFiltroEstado('critico')}
            className={cn(
              'rounded-xl border px-3.5 py-1.5',
              filtroEstado === 'critico'
                ? 'border-peligro bg-peligro'
                : 'border-borde bg-superficie-alt'
            )}
          >
            <Text
              className={cn(
                'text-xs font-bold',
                filtroEstado === 'critico' ? 'text-white' : 'text-texto'
              )}
            >
              Stock Crítico ({resumen.articulosCriticos})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setFiltroEstado('embarque')}
            className={cn(
              'rounded-xl border px-3.5 py-1.5',
              filtroEstado === 'embarque'
                ? 'border-info bg-info'
                : 'border-borde bg-superficie-alt'
            )}
          >
            <Text
              className={cn(
                'text-xs font-bold',
                filtroEstado === 'embarque' ? 'text-white' : 'text-texto'
              )}
            >
              Con Embarque ({resumen.unidadesEmbarque} u.)
            </Text>
          </Pressable>
        </View>
      </Tarjeta>

      {/* Listado de Artículos con Stock Físico en Depósito */}
      <Tarjeta clase="gap-3">
        <View className="flex-row items-center justify-between">
          <EncabezadoTarjeta
            titulo="Existencias Físicas en Depósito"
            descripcion={`Mostrando ${articulos.length} artículos con stock positivo`}
            icono="layers-outline"
          />
          <BotonIcono
            icono="refresh-outline"
            variante="fantasma"
            alPresionar={() => void cargarDatos(true)}
            etiquetaAccesible="Refrescar existencias"
          />
        </View>

        {cargando ? (
          <View className="py-12 items-center justify-center">
            <ActivityIndicator size="large" color={tokens.primario} />
            <Text className="mt-3 text-xs text-texto-suave">
              Cargando existencias del depósito...
            </Text>
          </View>
        ) : articulos.length === 0 ? (
          <View className="py-10 items-center justify-center rounded-2xl border border-borde bg-superficie-alt p-6">
            <Ionicons name="cube-outline" size={36} color={tokens.textoSuave} />
            <Text className="mt-3 text-sm font-bold text-texto text-center">
              No se encontraron artículos con stock en depósito
            </Text>
            <Text className="mt-1 text-xs text-texto-suave text-center">
              {busqueda
                ? 'Probá cambiando el término de búsqueda o el filtro seleccionado.'
                : 'No hay productos con existencias cargadas actualmente.'}
            </Text>
          </View>
        ) : (
          <View className="gap-2.5">
            {articulos.map((art) => {
              const medidas = [art.ejeTexto, art.alojTexto, art.altTexto]
                .filter(Boolean)
                .join(' × ');

              const esBajo = art.stock <= art.stockMinimo;

              return (
                <View
                  key={art.id}
                  className="rounded-2xl border border-borde bg-superficie-alt p-4 gap-2.5"
                >
                  <View className="flex-row items-start justify-between gap-2">
                    <View className="flex-1">
                      <View className="flex-row flex-wrap items-center gap-2">
                        <Text className="font-mono text-base font-bold text-texto">
                          {art.codigo}
                        </Text>
                        <Insignia texto={art.categoriaNombre} tono="primario" />
                        {art.giro ? <Insignia texto={art.giro} tono="neutro" /> : null}
                      </View>
                      {medidas ? (
                        <Text className="mt-1 text-xs font-semibold text-texto-suave">
                          Medidas: <Text className="text-texto">{medidas} mm</Text>
                        </Text>
                      ) : null}
                      {art.observaciones ? (
                        <Text className="text-xs text-texto-suave mt-0.5" numberOfLines={2}>
                          {art.observaciones}
                        </Text>
                      ) : null}
                    </View>

                    {/* Badge destacado de Stock en Depósito */}
                    <View className="items-end gap-1">
                      <View
                        className={cn(
                          'rounded-xl px-3 py-1.5 flex-row items-center gap-1.5',
                          esBajo ? 'bg-peligro/15 border border-peligro/30' : 'bg-exito/15 border border-exito/30'
                        )}
                      >
                        <Ionicons
                          name={esBajo ? 'alert-circle' : 'cube'}
                          size={14}
                          color={esBajo ? tokens.peligro : tokens.exito}
                        />
                        <Text
                          className={cn(
                            'text-sm font-bold',
                            esBajo ? 'text-peligro' : 'text-exito'
                          )}
                        >
                          {art.stock} u.
                        </Text>
                      </View>
                      <Text className="text-[10px] text-texto-suave">
                        Mínimo: {art.stockMinimo} u.
                      </Text>
                    </View>
                  </View>

                  {/* Fila inferior: detalles y botones de acción rápida de depósito */}
                  <View className="flex-row flex-wrap items-center justify-between border-t border-borde/60 pt-2 gap-2">
                    <View className="flex-row items-center gap-3">
                      {art.uxb ? (
                        <Text className="text-[11px] text-texto-suave">
                          UXB: <Text className="font-semibold text-texto">{art.uxb} u.</Text>
                        </Text>
                      ) : null}
                      {art.proximoEmbarque > 0 ? (
                        <Text className="text-[11px] text-info font-medium">
                          🚢 Próx. Emb: {art.proximoEmbarque} u.
                        </Text>
                      ) : null}
                    </View>

                    <View className="flex-row items-center gap-2">
                      <Boton
                        titulo="+ Ingreso"
                        variante="secundario"
                        tamano="chico"
                        onPress={() => abrirModalMovimiento(art, 'ingreso')}
                      />
                      <Boton
                        titulo="- Egreso"
                        variante="secundario"
                        tamano="chico"
                        onPress={() => abrirModalMovimiento(art, 'egreso')}
                      />
                      <Boton
                        titulo="Ajustar"
                        variante="primario"
                        tamano="chico"
                        onPress={() => abrirModalMovimiento(art, 'ajuste')}
                      />
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </Tarjeta>

      {/* Modal para Registrar Movimiento o Ajuste Físico de Depósito */}
      <Modal visible={modalAbierto} transparent animationType="fade">
        <View className="flex-1 items-center justify-center bg-black/60 p-4">
          <View
            style={{ backgroundColor: tokens.superficie, borderColor: tokens.borde }}
            className="w-full max-w-md rounded-3xl border p-5 gap-4"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-lg font-bold text-texto">
                  {tipoMovimiento === 'ingreso'
                    ? 'Ingreso a Depósito'
                    : tipoMovimiento === 'egreso'
                    ? 'Egreso de Depósito'
                    : 'Ajuste de Conteo Físico'}
                </Text>
                <Text className="text-xs text-texto-suave">
                  Artículo: <Text className="font-bold text-texto">{articuloSeleccionado?.codigo}</Text> (Stock actual: {articuloSeleccionado?.stock} u.)
                </Text>
              </View>
              <BotonIcono
                icono="close-outline"
                variante="fantasma"
                alPresionar={() => setModalAbierto(false)}
                etiquetaAccesible="Cerrar modal"
              />
            </View>

            {/* Selector de Tipo */}
            <View className="flex-row gap-2">
              {(['ingreso', 'egreso', 'ajuste'] as const).map((t) => (
                <Pressable
                  key={t}
                  onPress={() => {
                    setTipoMovimiento(t);
                    if (t === 'ajuste' && articuloSeleccionado) {
                      setCantidad(String(articuloSeleccionado.stock));
                    }
                  }}
                  className={cn(
                    'flex-1 items-center justify-center rounded-xl border py-2',
                    tipoMovimiento === t
                      ? 'border-primario bg-primario'
                      : 'border-borde bg-superficie-alt'
                  )}
                >
                  <Text
                    className={cn(
                      'text-xs font-bold capitalize',
                      tipoMovimiento === t
                        ? esOscuro
                          ? 'text-fondo'
                          : 'text-white'
                        : 'text-texto'
                    )}
                  >
                    {t}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Entrada
              etiqueta={
                tipoMovimiento === 'ajuste'
                  ? 'Nuevo stock físico real en estantería *'
                  : 'Cantidad de unidades *'
              }
              icono="cube-outline"
              keyboardType="number-pad"
              placeholder={tipoMovimiento === 'ajuste' ? 'Stock resultante exacto' : 'Cantidad'}
              value={cantidad}
              onChangeText={setCantidad}
            />

            <Entrada
              etiqueta="N° Remito / Referencia"
              icono="document-text-outline"
              placeholder="Ej. REM-2026-0045, FAC-1290..."
              value={referencia}
              onChangeText={setReferencia}
            />

            <Entrada
              etiqueta="Motivo / Observaciones"
              icono="chatbubble-ellipses-outline"
              placeholder="Ej. Arribo de proveedor, venta mostrador, recuento estante..."
              value={motivo}
              onChangeText={setMotivo}
            />

            <View className="flex-row items-center justify-end gap-2 pt-2">
              <Boton
                titulo="Cancelar"
                variante="fantasma"
                onPress={() => setModalAbierto(false)}
              />
              <Boton
                titulo={guardando ? 'Guardando...' : 'Confirmar en Depósito'}
                variante="primario"
                cargando={guardando}
                onPress={() => void confirmarMovimiento()}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

/**
 * @file Módulo de movimientos de stock: registro transaccional de entradas,
 *       salidas y ajustes, consulta del historial y alertas de reposición.
 * @module client/src/pantallas/Stock
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
import { Boton } from '../componentes/ui/Boton';
import { Entrada } from '../componentes/ui/Entrada';
import { Insignia, tonoDeStock } from '../componentes/ui/Insignia';
import { EncabezadoTarjeta, Tarjeta } from '../componentes/ui/Tarjeta';
import { peticion, peticionConMeta } from '../servicios/api';
import { useTema } from '../tema/TemaProvider';
import { cn } from '../utils/cn';
import type { ProductoItem } from './Productos';

interface MovimientoItem {
  id: number;
  producto_id: number;
  producto_codigo: string;
  tipo: 'ingreso' | 'egreso' | 'ajuste';
  cantidad: number;
  stock_anterior: number;
  stock_resultante: number;
  motivo: string | null;
  referencia: string | null;
  creado_en: string;
  usuario_nombre: string | null;
}

interface AlertaItem {
  producto_id: number;
  codigo: string;
  categoria: string;
  eje: string | null;
  aloj: string | null;
  alt: string | null;
  stock: number;
  stock_minimo: number;
  faltante: number;
}

function formatearFecha(fecha: string): string {
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return fecha;
  return d.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/** Pantalla de movimientos y alertas de stock. */
export function Stock() {
  const { tokens, claseRaiz, estiloVariables } = useTema();
  const { avisar } = usePopUps();

  const [vista, setVista] = useState<'movimientos' | 'alertas'>('movimientos');
  const [filtroTipo, setFiltroTipo] = useState<'' | 'ingreso' | 'egreso' | 'ajuste'>('');
  const [movimientos, setMovimientos] = useState<MovimientoItem[]>([]);
  const [alertas, setAlertas] = useState<AlertaItem[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  // Modal de nuevo movimiento
  const [modalAbierto, setModalAbierto] = useState(false);
  const [busquedaProd, setBusquedaProd] = useState('');
  const [sugerencias, setSugerencias] = useState<ProductoItem[]>([]);
  const [prodSeleccionado, setProdSeleccionado] = useState<{
    id: number;
    codigo: string;
    stock: number;
  } | null>(null);
  const [tipoMov, setTipoMov] = useState<'ingreso' | 'egreso' | 'ajuste'>('ingreso');
  const [cantidad, setCantidad] = useState('');
  const [motivo, setMotivo] = useState('');
  const [referencia, setReferencia] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(
    async (silencioso = false) => {
      if (!silencioso) setCargando(true);
      else setRefrescando(true);
      try {
        const [{ datos: movs }, listaAlertas] = await Promise.all([
          peticionConMeta<MovimientoItem[]>('/stock/movimientos', {
            consulta: { tipo: filtroTipo || undefined, limite: 50 }
          }),
          peticion<AlertaItem[]>('/stock/alertas')
        ]);
        setMovimientos(movs);
        setAlertas(listaAlertas);
      } catch (error) {
        avisar(
          error instanceof Error ? error.message : 'No se pudo cargar el módulo de stock.',
          'peligro'
        );
      } finally {
        setCargando(false);
        setRefrescando(false);
      }
    },
    [filtroTipo, avisar]
  );

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const buscarProducto = async (texto: string) => {
    setBusquedaProd(texto);
    if (texto.trim().length < 2) {
      setSugerencias([]);
      return;
    }
    try {
      const res = await peticion<ProductoItem[]>('/productos/buscar', {
        consulta: { q: texto.trim() }
      });
      setSugerencias(res.slice(0, 8));
    } catch {
      setSugerencias([]);
    }
  };

  const abrirModalMovimiento = (
    preseleccionado?: { id: number; codigo: string; stock: number },
    tipoInicial: 'ingreso' | 'egreso' | 'ajuste' = 'ingreso'
  ) => {
    setProdSeleccionado(preseleccionado ?? null);
    setBusquedaProd(preseleccionado ? preseleccionado.codigo : '');
    setSugerencias([]);
    setTipoMov(tipoInicial);
    setCantidad('');
    setMotivo('');
    setReferencia('');
    setModalAbierto(true);
  };

  const guardarMovimiento = async () => {
    if (!prodSeleccionado) {
      avisar('Seleccioná un producto primero.', 'advertencia');
      return;
    }
    const cantNum = Number.parseInt(cantidad, 10);
    if (!Number.isFinite(cantNum) || cantNum <= 0) {
      avisar('Ingresá una cantidad entera mayor a cero.', 'advertencia');
      return;
    }

    setGuardando(true);
    try {
      await peticion('/stock/movimientos', {
        metodo: 'POST',
        cuerpo: {
          producto_id: prodSeleccionado.id,
          tipo: tipoMov,
          cantidad: cantNum,
          motivo: motivo.trim() || undefined,
          referencia: referencia.trim() || undefined
        }
      });
      avisar('Movimiento registrado correctamente.', 'exito');
      setModalAbierto(false);
      await cargar(true);
    } catch (error) {
      avisar(
        error instanceof Error ? error.message : 'No se pudo registrar el movimiento.',
        'peligro'
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <View className="flex-1 bg-fondo">
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 p-5 pb-10"
        refreshControl={
          <RefreshControl
            refreshing={refrescando}
            onRefresh={() => void cargar(true)}
            tintColor={tokens.primario}
          />
        }
      >
        {/* Encabezado */}
        <View className="flex-row flex-wrap items-center justify-between gap-3">
          <View className="flex-row items-center gap-3">
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primario/12">
              <Ionicons name="cube-outline" size={24} color={tokens.primario} />
            </View>
            <View>
              <Text className="text-xl font-bold text-texto">Movimientos de Stock</Text>
              <Text className="text-sm text-texto-suave">
                Entradas, salidas, ajustes y alertas de reposición
              </Text>
            </View>
          </View>
          <Boton
            titulo="Registrar movimiento"
            icono="add-circle-outline"
            tamano="sm"
            onPress={() => abrirModalMovimiento()}
          />
        </View>

        {/* Selector de pestaña */}
        <View className="flex-row gap-2">
          <Boton
            titulo={`Historial (${movimientos.length})`}
            icono="swap-vertical-outline"
            variante={vista === 'movimientos' ? 'primario' : 'secundario'}
            tamano="sm"
            onPress={() => setVista('movimientos')}
          />
          <Boton
            titulo={`Alertas bajo mínimo (${alertas.length})`}
            icono="warning-outline"
            variante={vista === 'alertas' ? 'primario' : 'secundario'}
            tamano="sm"
            onPress={() => setVista('alertas')}
          />
        </View>

        {vista === 'movimientos' ? (
          <>
            {/* Filtro por tipo */}
            <View className="flex-row flex-wrap gap-2">
              {(
                [
                  { id: '', texto: 'Todos' },
                  { id: 'ingreso', texto: 'Ingresos' },
                  { id: 'egreso', texto: 'Egresos' },
                  { id: 'ajuste', texto: 'Ajustes' }
                ] as const
              ).map((item) => {
                const activo = filtroTipo === item.id;
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => setFiltroTipo(item.id)}
                    className={cn(
                      'rounded-full border px-3 py-1.5',
                      activo
                        ? 'border-primario bg-primario'
                        : 'border-borde bg-superficie'
                    )}
                  >
                    <Text
                      className={cn(
                        'text-xs font-bold',
                        activo ? 'text-white' : 'text-texto'
                      )}
                    >
                      {item.texto}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {cargando ? (
              <View className="items-center py-10">
                <ActivityIndicator size="large" color={tokens.primario} />
              </View>
            ) : movimientos.length === 0 ? (
              <Tarjeta clase="items-center py-10">
                <Ionicons name="cube-outline" size={32} color={tokens.textoSuave} />
                <Text className="mt-2 text-base font-bold text-texto">
                  Sin movimientos registrados
                </Text>
                <Text className="text-center text-sm text-texto-suave">
                  Usá el botón "Registrar movimiento" para cargar un ingreso, egreso o ajuste.
                </Text>
              </Tarjeta>
            ) : (
              <View className="gap-2.5">
                {movimientos.map((mov) => (
                  <Tarjeta key={mov.id} compacta clase="gap-1.5">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-2">
                        <Insignia
                          texto={mov.tipo.toUpperCase()}
                          tono={
                            mov.tipo === 'ingreso'
                              ? 'exito'
                              : mov.tipo === 'egreso'
                                ? 'peligro'
                                : 'info'
                          }
                        />
                        <Text className="text-base font-bold text-texto">
                          Código {mov.producto_codigo ?? `#${mov.producto_id}`}
                        </Text>
                      </View>
                      <Text className="text-sm font-bold text-primario">
                        Cant: {mov.cantidad} ({mov.stock_anterior} → {mov.stock_resultante})
                      </Text>
                    </View>
                    <Text className="text-xs text-texto-suave">
                      {mov.motivo || 'Sin motivo'}
                      {mov.referencia ? ` · Ref: ${mov.referencia}` : ''} ·{' '}
                      {formatearFecha(mov.creado_en)}
                      {mov.usuario_nombre ? ` · ${mov.usuario_nombre.trim()}` : ''}
                    </Text>
                  </Tarjeta>
                ))}
              </View>
            )}
          </>
        ) : (
          <View className="gap-2.5">
            {alertas.length === 0 ? (
              <Tarjeta clase="items-center py-10">
                <Ionicons name="checkmark-circle-outline" size={32} color={tokens.exito} />
                <Text className="mt-2 text-base font-bold text-texto">
                  Sin alertas de stock mínimo
                </Text>
              </Tarjeta>
            ) : (
              alertas.map((al) => (
                <Tarjeta
                  key={al.producto_id}
                  compacta
                  clase="flex-row flex-wrap items-center justify-between gap-3"
                >
                  <View className="min-w-[180px] flex-1">
                    <Text className="text-base font-bold text-primario">Código {al.codigo}</Text>
                    <Text className="text-xs text-texto-suave">
                      {al.categoria} · Medidas: {al.eje ?? '—'} × {al.aloj ?? '—'} ×{' '}
                      {al.alt ?? '—'}
                    </Text>
                    <View className="mt-1">
                      <Insignia
                        texto={`Stock: ${al.stock} / Mín: ${al.stock_minimo} (Faltan ${al.faltante})`}
                        tono={tonoDeStock(al.stock, al.stock_minimo)}
                      />
                    </View>
                  </View>
                  <Boton
                    titulo="Reponer"
                    icono="add-outline"
                    tamano="sm"
                    onPress={() =>
                      abrirModalMovimiento(
                        { id: al.producto_id, codigo: al.codigo, stock: al.stock },
                        'ingreso'
                      )
                    }
                  />
                </Tarjeta>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Modal para registrar movimiento */}
      <Modal
        visible={modalAbierto}
        transparent
        animationType="fade"
        onRequestClose={() => setModalAbierto(false)}
      >
        <View
          style={estiloVariables}
          className={cn(claseRaiz, 'flex-1 items-center justify-center bg-black/50 p-4')}
        >
          <View
            style={{ backgroundColor: tokens.superficie, borderColor: tokens.borde }}
            className="max-h-[90%] w-full max-w-md rounded-2xl border border-borde bg-superficie p-5"
          >
            <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="gap-3">
              <EncabezadoTarjeta
                titulo="Registrar Movimiento"
                descripcion="Actualiza el stock del producto de forma inmediata"
                icono="cube-outline"
              />

              <Entrada
                etiqueta="Buscar producto por código o medida"
                icono="search-outline"
                placeholder="Ej: 11056500"
                value={busquedaProd}
                onChangeText={(t) => void buscarProducto(t)}
              />

              {sugerencias.length > 0 && (
                <View className="rounded-xl border border-borde bg-superficie-alt p-2">
                  {sugerencias.map((s) => (
                    <Pressable
                      key={s.id}
                      onPress={() => {
                        setProdSeleccionado({ id: s.id, codigo: s.codigo, stock: s.stock });
                        setBusquedaProd(`${s.codigo} (Stock actual: ${s.stock})`);
                        setSugerencias([]);
                      }}
                      className="border-b border-borde py-2 last:border-b-0"
                    >
                      <Text className="text-sm font-bold text-texto">
                        {s.codigo} — Stock: {s.stock}
                      </Text>
                      <Text className="text-xs text-texto-suave">
                        {s.categoriaNombre} · {s.ejeTexto ?? '—'}×{s.alojTexto ?? '—'}×
                        {s.altTexto ?? '—'}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}

              {prodSeleccionado && (
                <Insignia
                  texto={`Seleccionado: ${prodSeleccionado.codigo} (Stock actual: ${prodSeleccionado.stock})`}
                  tono="primario"
                />
              )}

              <Text className="text-sm font-semibold text-texto-suave">Tipo de movimiento</Text>
              <View className="flex-row gap-2">
                {(['ingreso', 'egreso', 'ajuste'] as const).map((t) => (
                  <Pressable
                    key={t}
                    onPress={() => setTipoMov(t)}
                    className={cn(
                      'flex-1 items-center rounded-xl border py-2.5',
                      tipoMov === t
                        ? 'border-primario bg-primario'
                        : 'border-borde bg-superficie-alt'
                    )}
                  >
                    <Text
                      className={cn(
                        'text-xs font-bold uppercase',
                        tipoMov === t ? 'text-white' : 'text-texto'
                      )}
                    >
                      {t}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Entrada
                etiqueta={
                  tipoMov === 'ajuste' ? 'Nuevo stock físico resultante *' : 'Cantidad *'
                }
                placeholder="Ej: 10"
                keyboardType="numeric"
                value={cantidad}
                onChangeText={setCantidad}
              />

              <Entrada
                etiqueta="Motivo"
                placeholder="Ej: Compra a proveedor / Venta mostrador"
                value={motivo}
                onChangeText={setMotivo}
              />

              <Entrada
                etiqueta="Referencia / Comprobante"
                placeholder="Ej: Remito 0001-00012345"
                value={referencia}
                onChangeText={setReferencia}
              />

              <View className="mt-3 flex-row justify-end gap-2">
                <Boton
                  titulo="Cancelar"
                  variante="secundario"
                  onPress={() => setModalAbierto(false)}
                />
                <Boton
                  titulo="Confirmar"
                  cargando={guardando}
                  onPress={() => void guardarMovimiento()}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

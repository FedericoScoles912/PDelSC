/**
 * @file Panel principal (Dashboard) con indicadores generales de stock,
 *       resumen por categoría, alertas de reposición y últimos movimientos.
 * @module client/src/pantallas/Dashboard
 */

import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from 'react-native';

import { usePopUps } from '../componentes/popups/PopUpsProvider';
import { Boton } from '../componentes/ui/Boton';
import { Insignia, tonoDeStock } from '../componentes/ui/Insignia';
import { EncabezadoTarjeta, Tarjeta } from '../componentes/ui/Tarjeta';
import { peticion } from '../servicios/api';
import { useTema } from '../tema/TemaProvider';

interface ResumenDashboard {
  productos: { total: number; activos: number; inactivos: number };
  stock: {
    bajoMinimo: number;
    sinStock: number;
    unidadesTotales: number;
    valorTotal: number;
  };
  categorias: { total: number };
  usuarios: { total: number; activos: number };
  movimientos: {
    ultimos7Dias: number;
    ingresos7Dias: number;
    egresos7Dias: number;
  };
  porCategoria: Array<{
    categoria_id: number;
    categoria: string;
    total_productos: number;
    stock_total: number;
    valor_stock: number;
    productos_bajo_minimo: number;
  }>;
  ultimosMovimientos: Array<{
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
  }>;
  alertasStock: Array<{
    producto_id: number;
    codigo: string;
    categoria: string;
    eje: string | null;
    aloj: string | null;
    alt: string | null;
    stock: number;
    stock_minimo: number;
    faltante: number;
  }>;
}

function formatearMoneda(valor: number): string {
  return `$${Number(valor || 0).toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function formatearFecha(fecha: string | null | undefined): string {
  if (!fecha) return '—';
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return String(fecha);
  return d.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/** Pantalla principal de indicadores. */
export function Dashboard() {
  const { tokens } = useTema();
  const { avisar } = usePopUps();
  const [datos, setDatos] = useState<ResumenDashboard | null>(null);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  const cargar = useCallback(
    async (silencioso = false) => {
      if (!silencioso) setCargando(true);
      else setRefrescando(true);
      try {
        const respuesta = await peticion<ResumenDashboard>('/dashboard/resumen');
        setDatos(respuesta);
      } catch (error) {
        avisar(
          error instanceof Error ? error.message : 'No se pudo cargar el panel.',
          'peligro'
        );
      } finally {
        setCargando(false);
        setRefrescando(false);
      }
    },
    [avisar]
  );

  useEffect(() => {
    void cargar();
  }, [cargar]);

  if (cargando && !datos) {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-fondo p-6">
        <ActivityIndicator size="large" color={tokens.primario} />
        <Text className="text-sm text-texto-suave">Cargando indicadores de Stocker…</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-fondo"
      contentContainerClassName="gap-5 p-5 pb-10"
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
            <Ionicons name="speedometer-outline" size={24} color={tokens.primario} />
          </View>
          <View>
            <Text className="text-xl font-bold text-texto">Panel General</Text>
            <Text className="text-sm text-texto-suave">
              Resumen de catálogo, existencias y actividad reciente
            </Text>
          </View>
        </View>
        <Boton
          titulo="Actualizar"
          icono="refresh-outline"
          variante="secundario"
          tamano="sm"
          cargando={refrescando}
          onPress={() => void cargar(true)}
        />
      </View>

      {/* Tarjetas de KPIs principales */}
      <View className="flex-row flex-wrap gap-3">
        <Tarjeta clase="min-w-[160px] flex-1 gap-1" compacta>
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-bold uppercase text-texto-suave">Productos</Text>
            <Ionicons name="pricetags-outline" size={18} color={tokens.primario} />
          </View>
          <Text className="text-2xl font-bold text-texto">{datos?.productos.total ?? 0}</Text>
          <Text className="text-xs text-texto-suave">
            {datos?.productos.activos ?? 0} activos · {datos?.categorias.total ?? 0} categorías
          </Text>
        </Tarjeta>

        <Tarjeta clase="min-w-[160px] flex-1 gap-1" compacta>
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-bold uppercase text-texto-suave">Unidades en Stock</Text>
            <Ionicons name="cube-outline" size={18} color={tokens.exito} />
          </View>
          <Text className="text-2xl font-bold text-texto">
            {datos?.stock.unidadesTotales ?? 0}
          </Text>
          <Text className="text-xs text-texto-suave">
            Valor: {formatearMoneda(datos?.stock.valorTotal ?? 0)}
          </Text>
        </Tarjeta>

        <Tarjeta clase="min-w-[160px] flex-1 gap-1" compacta>
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-bold uppercase text-texto-suave">Alertas de Stock</Text>
            <Ionicons name="warning-outline" size={18} color={tokens.advertencia} />
          </View>
          <Text className="text-2xl font-bold text-texto">{datos?.stock.bajoMinimo ?? 0}</Text>
          <Text className="text-xs text-texto-suave">
            {datos?.stock.sinStock ?? 0} productos sin stock
          </Text>
        </Tarjeta>

        <Tarjeta clase="min-w-[160px] flex-1 gap-1" compacta>
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-bold uppercase text-texto-suave">Movimientos (7d)</Text>
            <Ionicons name="swap-vertical-outline" size={18} color={tokens.info} />
          </View>
          <Text className="text-2xl font-bold text-texto">
            {datos?.movimientos.ultimos7Dias ?? 0}
          </Text>
          <Text className="text-xs text-texto-suave">
            +{datos?.movimientos.ingresos7Dias ?? 0} ing. / -{datos?.movimientos.egresos7Dias ?? 0}{' '}
            egr.
          </Text>
        </Tarjeta>
      </View>

      {/* Resumen por Categoría */}
      <Tarjeta>
        <EncabezadoTarjeta
          titulo="Distribución por Categoría"
          descripcion="Productos activos y existencias agrupadas por familia"
          icono="grid-outline"
        />
        <View className="gap-2.5">
          {(datos?.porCategoria ?? []).map((cat) => (
            <View
              key={cat.categoria_id}
              className="flex-row flex-wrap items-center justify-between gap-2 rounded-xl border border-borde bg-superficie-alt p-3"
            >
              <View className="min-w-[180px] flex-1">
                <Text className="text-sm font-bold text-texto">{cat.categoria}</Text>
                <Text className="text-xs text-texto-suave">
                  {cat.total_productos} productos · Stock total: {cat.stock_total} u.
                </Text>
              </View>
              <View className="items-end gap-1">
                <Insignia
                  texto={formatearMoneda(Number(cat.valor_stock ?? 0))}
                  tono="primario"
                />
                {Number(cat.productos_bajo_minimo) > 0 && (
                  <Insignia
                    texto={`${cat.productos_bajo_minimo} bajo mín.`}
                    tono="advertencia"
                  />
                )}
              </View>
            </View>
          ))}
          {(datos?.porCategoria ?? []).length === 0 && (
            <Text className="py-4 text-center text-sm text-texto-suave">
              No hay categorías registradas.
            </Text>
          )}
        </View>
      </Tarjeta>

      {/* Alertas de Stock Bajo Mínimo */}
      <Tarjeta>
        <EncabezadoTarjeta
          titulo="Alertas de Reposición"
          descripcion="Artículos cuyo stock actual está en o por debajo del mínimo"
          icono="alert-circle-outline"
        />
        <View className="gap-2">
          {(datos?.alertasStock ?? []).map((item) => (
            <View
              key={item.producto_id}
              className="flex-row items-center justify-between gap-3 rounded-xl border border-borde bg-superficie-alt p-3"
            >
              <View className="flex-1">
                <Text className="text-sm font-bold text-texto">Código: {item.codigo}</Text>
                <Text className="text-xs text-texto-suave">
                  {item.categoria} · Medidas: {item.eje ?? '—'} × {item.aloj ?? '—'} ×{' '}
                  {item.alt ?? '—'}
                </Text>
              </View>
              <Insignia
                texto={`Stock: ${item.stock} / Mín: ${item.stock_minimo}`}
                tono={tonoDeStock(item.stock, item.stock_minimo)}
              />
            </View>
          ))}
          {(datos?.alertasStock ?? []).length === 0 && (
            <Text className="py-4 text-center text-sm text-texto-suave">
              No hay alertas de stock mínimo pendientes.
            </Text>
          )}
        </View>
      </Tarjeta>

      {/* Últimos Movimientos */}
      <Tarjeta>
        <EncabezadoTarjeta
          titulo="Actividad Reciente de Stock"
          descripcion="Últimos 10 movimientos registrados en el depósito"
          icono="time-outline"
        />
        <View className="gap-2">
          {(datos?.ultimosMovimientos ?? []).map((mov) => (
            <View
              key={mov.id}
              className="flex-row flex-wrap items-center justify-between gap-2 rounded-xl border border-borde bg-superficie-alt p-3"
            >
              <View className="min-w-[180px] flex-1">
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
                  <Text className="text-sm font-bold text-texto">
                    {mov.producto_codigo ?? `#${mov.producto_id}`}
                  </Text>
                </View>
                <Text className="mt-1 text-xs text-texto-suave">
                  {mov.motivo || 'Sin motivo'} · {formatearFecha(mov.creado_en)}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-sm font-bold text-texto">
                  Cant: {mov.cantidad} ({mov.stock_anterior} → {mov.stock_resultante})
                </Text>
                {mov.usuario_nombre ? (
                  <Text className="text-xs text-texto-suave">{mov.usuario_nombre.trim()}</Text>
                ) : null}
              </View>
            </View>
          ))}
          {(datos?.ultimosMovimientos ?? []).length === 0 && (
            <Text className="py-4 text-center text-sm text-texto-suave">
              Todavía no se registraron movimientos de stock.
            </Text>
          )}
        </View>
      </Tarjeta>
    </ScrollView>
  );
}

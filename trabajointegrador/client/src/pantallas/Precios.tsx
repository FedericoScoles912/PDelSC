/**
 * @file Módulo de gestión de precios: consulta de lista vigente, cambio
 *       puntual con motivo, ajuste porcentual masivo e historial de cambios.
 * @module client/src/pantallas/Precios
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
import { Insignia } from '../componentes/ui/Insignia';
import { EncabezadoTarjeta, Tarjeta } from '../componentes/ui/Tarjeta';
import { useSeleccionar } from '../estado/store';
import { peticion, peticionConMeta } from '../servicios/api';
import { useTema } from '../tema/TemaProvider';
import { cn } from '../utils/cn';
import type { ProductoItem } from './Productos';

interface HistorialPrecioItem {
  id: number;
  producto_id: number;
  precio_anterior: number | null;
  precio_nuevo: number | null;
  origen: string;
  creado_en: string;
  usuario_nombre: string | null;
}

interface CategoriaItem {
  id: number;
  nombre: string;
}

function formatearMoneda(valor: number | null | undefined): string {
  if (valor === null || valor === undefined) return 'Sin precio';
  return `$${Number(valor).toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

/** Pantalla de lista de precios, ajustes e historial. */
export function Precios() {
  const { tokens, claseRaiz, estiloVariables } = useTema();
  const { avisar, confirmar } = usePopUps();
  const rol = useSeleccionar((estado) => estado.sesion.usuario?.rol.codigo);
  const esAdmin = rol === 'admin';

  const [productos, setProductos] = useState<ProductoItem[]>([]);
  const [categorias, setCategorias] = useState<CategoriaItem[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  // Modal de historial y cambio individual
  const [seleccionado, setSeleccionado] = useState<ProductoItem | null>(null);
  const [historial, setHistorial] = useState<HistorialPrecioItem[]>([]);
  const [cargandoHist, setCargandoHist] = useState(false);
  const [nuevoPrecio, setNuevoPrecio] = useState('');
  const [motivoPrecio, setMotivoPrecio] = useState('');
  const [guardandoPrecio, setGuardandoPrecio] = useState(false);

  // Modal de ajuste masivo
  const [modalMasivo, setModalMasivo] = useState(false);
  const [porcentajeMasivo, setPorcentajeMasivo] = useState('');
  const [categoriaMasivaId, setCategoriaMasivaId] = useState<number | null>(null);
  const [decimalesMasivo, setDecimalesMasivo] = useState('2');
  const [aplicandoMasivo, setAplicandoMasivo] = useState(false);

  const cargar = useCallback(
    async (silencioso = false) => {
      if (!silencioso) setCargando(true);
      else setRefrescando(true);
      try {
        const [{ datos, meta }, cats] = await Promise.all([
          peticionConMeta<ProductoItem[]>('/productos', {
            consulta: {
              q: busqueda.trim() || undefined,
              categoria_id: categoriaId ?? undefined,
              pagina,
              limite: 25
            }
          }),
          peticion<CategoriaItem[]>('/categorias')
        ]);
        setProductos(datos);
        setTotalPaginas(Math.max(1, Number(meta.totalPaginas ?? 1)));
        setCategorias(cats);
      } catch (error) {
        avisar(
          error instanceof Error ? error.message : 'No se pudieron cargar los precios.',
          'peligro'
        );
      } finally {
        setCargando(false);
        setRefrescando(false);
      }
    },
    [busqueda, categoriaId, pagina, avisar]
  );

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const abrirProducto = async (prod: ProductoItem) => {
    setSeleccionado(prod);
    setNuevoPrecio(prod.precioLista !== null ? String(prod.precioLista) : '');
    setMotivoPrecio('');
    setHistorial([]);
    setCargandoHist(true);
    try {
      const { datos } = await peticionConMeta<HistorialPrecioItem[]>(
        `/precios/productos/${prod.id}/historial`
      );
      setHistorial(datos);
    } catch {
      /* silencioso */
    } finally {
      setCargandoHist(false);
    }
  };

  const guardarCambioIndividual = async () => {
    if (!seleccionado) return;
    const valor = Number(nuevoPrecio.replace(',', '.'));
    if (!Number.isFinite(valor) || valor < 0) {
      avisar('Ingresá un precio válido mayor o igual a cero.', 'advertencia');
      return;
    }
    setGuardandoPrecio(true);
    try {
      await peticion(`/precios/productos/${seleccionado.id}`, {
        metodo: 'PATCH',
        cuerpo: {
          precioLista: valor,
          motivo: motivoPrecio.trim() || undefined
        }
      });
      avisar('Precio actualizado correctamente.', 'exito');
      setSeleccionado(null);
      await cargar(true);
    } catch (error) {
      avisar(
        error instanceof Error ? error.message : 'No se pudo actualizar el precio.',
        'peligro'
      );
    } finally {
      setGuardandoPrecio(false);
    }
  };

  const aplicarAjusteMasivo = async () => {
    const porc = Number(porcentajeMasivo.replace(',', '.'));
    if (!Number.isFinite(porc) || porc === 0) {
      avisar('Ingresá un porcentaje distinto de cero (ej: 10 o -5).', 'advertencia');
      return;
    }
    const ok = await confirmar({
      titulo: 'Confirmar ajuste masivo',
      mensaje: `¿Aplicar un ${porc > 0 ? `+${porc}%` : `${porc}%`} a ${
        categoriaMasivaId
          ? 'la categoría seleccionada'
          : 'todos los productos con precio del catálogo'
      }?`
    });
    if (!ok) return;

    setAplicandoMasivo(true);
    try {
      const res = await peticion<{ afectados: number; porcentaje: number }>(
        '/precios/ajuste-masivo',
        {
          metodo: 'POST',
          cuerpo: {
            categoriaId: categoriaMasivaId ?? undefined,
            porcentaje: porc,
            redondearA: Number.parseInt(decimalesMasivo, 10) || 2
          }
        }
      );
      avisar(`Se actualizaron ${res.afectados} productos (${res.porcentaje}%).`, 'exito');
      setModalMasivo(false);
      await cargar(true);
    } catch (error) {
      avisar(
        error instanceof Error ? error.message : 'No se pudo aplicar el ajuste masivo.',
        'peligro'
      );
    } finally {
      setAplicandoMasivo(false);
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
              <Ionicons name="cash-outline" size={24} color={tokens.primario} />
            </View>
            <View>
              <Text className="text-xl font-bold text-texto">Lista de Precios</Text>
              <Text className="text-sm text-texto-suave">
                Precios vigentes, actualización e historial de variaciones
              </Text>
            </View>
          </View>
          {esAdmin && (
            <Boton
              titulo="Ajuste masivo (%)"
              icono="trending-up-outline"
              tamano="sm"
              onPress={() => {
                setPorcentajeMasivo('');
                setCategoriaMasivaId(null);
                setModalMasivo(true);
              }}
            />
          )}
        </View>

        {/* Búsqueda y categorías */}
        <Tarjeta compacta clase="gap-3">
          <Entrada
            icono="search-outline"
            placeholder="Buscar producto por código o descripción…"
            value={busqueda}
            onChangeText={(t) => {
              setBusqueda(t);
              setPagina(1);
            }}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
            <Pressable
              onPress={() => {
                setCategoriaId(null);
                setPagina(1);
              }}
              className={cn(
                'rounded-full border px-3 py-1.5',
                categoriaId === null
                  ? 'border-primario bg-primario'
                  : 'border-borde bg-superficie-alt'
              )}
            >
              <Text
                className={cn(
                  'text-xs font-bold',
                  categoriaId === null ? 'text-white' : 'text-texto'
                )}
              >
                Todas
              </Text>
            </Pressable>
            {categorias.map((c) => {
              const activa = categoriaId === c.id;
              return (
                <Pressable
                  key={c.id}
                  onPress={() => {
                    setCategoriaId(activa ? null : c.id);
                    setPagina(1);
                  }}
                  className={cn(
                    'rounded-full border px-3 py-1.5',
                    activa ? 'border-primario bg-primario' : 'border-borde bg-superficie-alt'
                  )}
                >
                  <Text className={cn('text-xs font-bold', activa ? 'text-white' : 'text-texto')}>
                    {c.nombre}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Tarjeta>

        {/* Lista */}
        {cargando ? (
          <View className="items-center py-12">
            <ActivityIndicator size="large" color={tokens.primario} />
          </View>
        ) : (
          <View className="gap-2.5">
            {productos.map((prod) => (
              <Pressable key={prod.id} onPress={() => void abrirProducto(prod)}>
                <Tarjeta
                  compacta
                  clase="flex-row flex-wrap items-center justify-between gap-3"
                >
                  <View className="min-w-[180px] flex-1">
                    <Text className="text-base font-bold text-primario">{prod.codigo}</Text>
                    <Text className="text-xs text-texto-suave">
                      {prod.categoriaNombre ?? 'Sin categoría'} · {prod.ejeTexto ?? '—'}×
                      {prod.alojTexto ?? '—'}×{prod.altTexto ?? '—'} mm
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <Insignia
                      texto={formatearMoneda(prod.precioLista)}
                      tono={prod.precioLista !== null ? 'exito' : 'neutro'}
                    />
                    <Ionicons
                      name="chevron-forward-outline"
                      size={18}
                      color={tokens.textoSuave}
                    />
                  </View>
                </Tarjeta>
              </Pressable>
            ))}
          </View>
        )}

        {totalPaginas > 1 && (
          <View className="flex-row items-center justify-between pt-2">
            <Boton
              titulo="Anterior"
              variante="secundario"
              tamano="sm"
              deshabilitado={pagina <= 1}
              onPress={() => setPagina((p) => Math.max(1, p - 1))}
            />
            <Text className="text-sm font-semibold text-texto">
              Página {pagina} de {totalPaginas}
            </Text>
            <Boton
              titulo="Siguiente"
              variante="secundario"
              tamano="sm"
              deshabilitado={pagina >= totalPaginas}
              onPress={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
            />
          </View>
        )}
      </ScrollView>

      {/* Modal de Historial / Cambio individual */}
      <Modal
        visible={Boolean(seleccionado)}
        transparent
        animationType="fade"
        onRequestClose={() => setSeleccionado(null)}
      >
        <View className="flex-1 items-center justify-center bg-black/50 p-4">
          <View className="max-h-[90%] w-full max-w-lg rounded-2xl border border-borde bg-superficie p-5">
            {seleccionado && (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="gap-4">
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-lg font-bold text-primario">
                      Precio — Código {seleccionado.codigo}
                    </Text>
                    <Text className="text-xs text-texto-suave">
                      Actual: {formatearMoneda(seleccionado.precioLista)}
                    </Text>
                  </View>
                  <BotonIcono icono="close" onPress={() => setSeleccionado(null)} />
                </View>

                {esAdmin && (
                  <View className="gap-3 rounded-xl border border-borde bg-superficie-alt p-3">
                    <Text className="text-xs font-bold uppercase text-texto-suave">
                      Actualizar precio individual
                    </Text>
                    <Entrada
                      etiqueta="Nuevo precio de lista ($)"
                      keyboardType="numeric"
                      value={nuevoPrecio}
                      onChangeText={setNuevoPrecio}
                    />
                    <Entrada
                      etiqueta="Motivo (opcional)"
                      placeholder="Ej: Actualización lista vigente"
                      value={motivoPrecio}
                      onChangeText={setMotivoPrecio}
                    />
                    <Boton
                      titulo="Guardar nuevo precio"
                      icono="save-outline"
                      cargando={guardandoPrecio}
                      onPress={() => void guardarCambioIndividual()}
                    />
                  </View>
                )}

                <View className="gap-2">
                  <Text className="text-sm font-bold text-texto">Historial de variaciones</Text>
                  {cargandoHist ? (
                    <ActivityIndicator size="small" color={tokens.primario} />
                  ) : historial.length === 0 ? (
                    <Text className="text-xs text-texto-suave">
                      No hay cambios históricos registrados para este producto.
                    </Text>
                  ) : (
                    historial.map((h) => (
                      <View
                        key={h.id}
                        className="flex-row items-center justify-between rounded-xl border border-borde bg-superficie-alt p-2.5"
                      >
                        <View>
                          <Text className="text-xs font-bold text-texto">
                            {formatearMoneda(h.precio_anterior)} → {formatearMoneda(h.precio_nuevo)}
                          </Text>
                          <Text className="text-[11px] text-texto-suave">
                            Origen: {h.origen} · {new Date(h.creado_en).toLocaleDateString('es-AR')}
                          </Text>
                        </View>
                      </View>
                    ))
                  )}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal Ajuste Masivo */}
      <Modal
        visible={modalMasivo}
        transparent
        animationType="fade"
        onRequestClose={() => setModalMasivo(false)}
      >
        <View
          style={estiloVariables}
          className={cn(claseRaiz, 'flex-1 items-center justify-center bg-black/50 p-4')}
        >
          <View
            style={{ backgroundColor: tokens.superficie, borderColor: tokens.borde }}
            className="w-full max-w-md rounded-2xl border border-borde bg-superficie p-5"
          >
            <EncabezadoTarjeta
              titulo="Ajuste Masivo Porcentual"
              descripcion="Aplica un incremento o descuento a toda una categoría o al catálogo completo"
              icono="trending-up-outline"
            />
            <View className="gap-3">
              <Entrada
                etiqueta="Porcentaje (%) *"
                placeholder="Ej: 15 (aumento) o -5 (descuento)"
                keyboardType="numeric"
                value={porcentajeMasivo}
                onChangeText={setPorcentajeMasivo}
              />
              <Entrada
                etiqueta="Decimales de redondeo (0 a 4)"
                keyboardType="numeric"
                value={decimalesMasivo}
                onChangeText={setDecimalesMasivo}
              />
              <Text className="text-xs font-semibold text-texto-suave">
                Alcance (tocá para elegir categoría o dejar en Todas)
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerClassName="gap-2"
              >
                <Pressable
                  onPress={() => setCategoriaMasivaId(null)}
                  className={cn(
                    'rounded-full border px-3 py-1.5',
                    categoriaMasivaId === null
                      ? 'border-primario bg-primario'
                      : 'border-borde bg-superficie-alt'
                  )}
                >
                  <Text
                    className={cn(
                      'text-xs font-bold',
                      categoriaMasivaId === null ? 'text-white' : 'text-texto'
                    )}
                  >
                    Todas las categorías
                  </Text>
                </Pressable>
                {categorias.map((c) => (
                  <Pressable
                    key={c.id}
                    onPress={() => setCategoriaMasivaId(c.id)}
                    className={cn(
                      'rounded-full border px-3 py-1.5',
                      categoriaMasivaId === c.id
                        ? 'border-primario bg-primario'
                        : 'border-borde bg-superficie-alt'
                    )}
                  >
                    <Text
                      className={cn(
                        'text-xs font-bold',
                        categoriaMasivaId === c.id ? 'text-white' : 'text-texto'
                      )}
                    >
                      {c.nombre}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

              <View className="mt-4 flex-row justify-end gap-2">
                <Boton
                  titulo="Cancelar"
                  variante="secundario"
                  onPress={() => setModalMasivo(false)}
                />
                <Boton
                  titulo="Aplicar ajuste"
                  cargando={aplicandoMasivo}
                  onPress={() => void aplicarAjusteMasivo()}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

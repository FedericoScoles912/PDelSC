/**
 * @file Catálogo de productos con búsqueda por texto, filtro por categoría,
 *       búsqueda técnica dimensional (Eje, Alojamiento, Altura ± Tolerancia),
 *       alta/edición de productos y gestión de equivalencias (OEM, A, S).
 * @module client/src/pantallas/Productos
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
import { Insignia, tonoDeEstado, tonoDeStock } from '../componentes/ui/Insignia';
import { EncabezadoTarjeta, Tarjeta } from '../componentes/ui/Tarjeta';
import { useSeleccionar } from '../estado/store';
import { peticion, peticionConMeta } from '../servicios/api';
import { useTema } from '../tema/TemaProvider';
import { cn } from '../utils/cn';

export interface ProductoItem {
  id: number;
  codigo: string;
  categoriaId: number | null;
  categoriaNombre: string | null;
  lanzamiento: number | boolean;
  ejeTexto: string | null;
  ejeValor: number | null;
  alojTexto: string | null;
  alojValor: number | null;
  altTexto: string | null;
  altValor: number | null;
  giro: string | null;
  uxb: number | null;
  observaciones: string | null;
  precioLista: number | null;
  proximoIngreso: number | boolean;
  proximoEmbarque: number;
  stock: number;
  stockMinimo: number;
  activo: number | boolean;
}

interface CategoriaItem {
  id: number;
  nombre: string;
  total_productos?: number;
}

interface EquivalenciaItem {
  id: number;
  producto_id: number;
  tipo: 'OEM' | 'A' | 'S';
  codigo: string;
}

function formatearPrecio(valor: number | null | undefined): string {
  if (valor === null || valor === undefined) return 'Consultar';
  return `$${Number(valor).toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

/** Pantalla del catálogo de productos. */
export function Productos() {
  const { tokens, claseRaiz, estiloVariables } = useTema();
  const { avisar, confirmar } = usePopUps();
  const puedeEditar = true;

  const [productos, setProductos] = useState<ProductoItem[]>([]);
  const [categorias, setCategorias] = useState<CategoriaItem[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  // Filtros y paginación
  const [busqueda, setBusqueda] = useState('');
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [filtroRapido, setFiltroRapido] = useState<
    'todos' | 'lanzamiento' | 'proximo' | 'stock_bajo' | 'sin_stock'
  >('todos');
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalRegistros, setTotalRegistros] = useState(0);

  // Búsqueda por medidas
  const [modoMedidas, setModoMedidas] = useState(false);
  const [eje, setEje] = useState('');
  const [aloj, setAloj] = useState('');
  const [alt, setAlt] = useState('');
  const [tolerancia, setTolerancia] = useState('0.5');
  const [giroFiltro, setGiroFiltro] = useState('');

  // Modal de detalle / equivalencias
  const [seleccionado, setSeleccionado] = useState<ProductoItem | null>(null);
  const [equivalencias, setEquivalencias] = useState<EquivalenciaItem[]>([]);
  const [cargandoEquiv, setCargandoEquiv] = useState(false);
  const [nuevoTipoEquiv, setNuevoTipoEquiv] = useState<'OEM' | 'A' | 'S'>('OEM');
  const [nuevoCodigoEquiv, setNuevoCodigoEquiv] = useState('');

  // Modal de crear / editar producto
  const [modalFormulario, setModalFormulario] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [formCodigo, setFormCodigo] = useState('');
  const [formCategoriaId, setFormCategoriaId] = useState<number | null>(null);
  const [formEje, setFormEje] = useState('');
  const [formAloj, setFormAloj] = useState('');
  const [formAlt, setFormAlt] = useState('');
  const [formGiro, setFormGiro] = useState('');
  const [formUxb, setFormUxb] = useState('1');
  const [formPrecio, setFormPrecio] = useState('');
  const [formStock, setFormStock] = useState('0');
  const [formStockMin, setFormStockMin] = useState('5');
  const [formObs, setFormObs] = useState('');

  const cargarCategorias = useCallback(async () => {
    try {
      const lista = await peticion<CategoriaItem[]>('/categorias');
      setCategorias(lista);
    } catch {
      /* silencioso */
    }
  }, []);

  const cargarProductos = useCallback(
    async (silencioso = false) => {
      if (!silencioso) setCargando(true);
      else setRefrescando(true);

      try {
        if (modoMedidas && (eje.trim() || aloj.trim() || alt.trim() || giroFiltro.trim())) {
          const lista = await peticion<ProductoItem[]>('/productos/buscar-medidas', {
            consulta: {
              eje: eje.trim() || undefined,
              aloj: aloj.trim() || undefined,
              alt: alt.trim() || undefined,
              tolerancia: tolerancia.trim() || '0.5',
              giro: giroFiltro.trim() || undefined,
              categoria_id: categoriaId ?? undefined
            }
          });
          setProductos(lista);
          setTotalRegistros(lista.length);
          setTotalPaginas(1);
        } else {
          const { datos, meta } = await peticionConMeta<ProductoItem[]>('/productos', {
            consulta: {
              q: busqueda.trim() || undefined,
              categoria_id: categoriaId ?? undefined,
              lanzamiento: filtroRapido === 'lanzamiento' ? 'true' : undefined,
              proximo_ingreso: filtroRapido === 'proximo' ? 'true' : undefined,
              stock_bajo: filtroRapido === 'stock_bajo' ? 'true' : undefined,
              sin_stock: filtroRapido === 'sin_stock' ? 'true' : undefined,
              pagina,
              limite: 25
            }
          });
          setProductos(datos);
          setTotalRegistros(Number(meta.total ?? datos.length));
          setTotalPaginas(Math.max(1, Number(meta.totalPaginas ?? 1)));
        }
      } catch (error) {
        avisar(
          error instanceof Error ? error.message : 'No se pudieron cargar los productos.',
          'peligro'
        );
      } finally {
        setCargando(false);
        setRefrescando(false);
      }
    },
    [modoMedidas, eje, aloj, alt, tolerancia, giroFiltro, categoriaId, busqueda, filtroRapido, pagina, avisar]
  );

  useEffect(() => {
    void cargarCategorias();
  }, [cargarCategorias]);

  useEffect(() => {
    void cargarProductos();
  }, [cargarProductos]);

  const abrirDetalle = async (prod: ProductoItem) => {
    setSeleccionado(prod);
    setEquivalencias([]);
    setCargandoEquiv(true);
    try {
      const lista = await peticion<EquivalenciaItem[]>(`/productos/${prod.id}/equivalencias`);
      setEquivalencias(lista);
    } catch {
      /* silencioso */
    } finally {
      setCargandoEquiv(false);
    }
  };

  const agregarEquiv = async () => {
    if (!seleccionado || !nuevoCodigoEquiv.trim()) return;
    try {
      const lista = await peticion<EquivalenciaItem[]>(
        `/productos/${seleccionado.id}/equivalencias`,
        {
          metodo: 'POST',
          cuerpo: { tipo: nuevoTipoEquiv, codigo: nuevoCodigoEquiv.trim() }
        }
      );
      setEquivalencias(lista);
      setNuevoCodigoEquiv('');
      avisar('Equivalencia agregada.', 'exito');
    } catch (error) {
      avisar(
        error instanceof Error ? error.message : 'No se pudo agregar la equivalencia.',
        'peligro'
      );
    }
  };

  const borrarEquiv = async (equivId: number) => {
    if (!seleccionado) return;
    const ok = await confirmar({
      titulo: 'Eliminar equivalencia',
      mensaje: '¿Seguro que querés eliminar este código equivalente?',
      peligroso: true
    });
    if (!ok) return;
    try {
      await peticion(`/productos/${seleccionado.id}/equivalencias/${equivId}`, {
        metodo: 'DELETE'
      });
      setEquivalencias((prev) => prev.filter((e) => e.id !== equivId));
      avisar('Equivalencia eliminada.', 'exito');
    } catch (error) {
      avisar(
        error instanceof Error ? error.message : 'No se pudo eliminar la equivalencia.',
        'peligro'
      );
    }
  };

  const abrirNuevo = () => {
    setEditandoId(null);
    setFormCodigo('');
    setFormCategoriaId(categorias[0]?.id ?? null);
    setFormEje('');
    setFormAloj('');
    setFormAlt('');
    setFormGiro('');
    setFormUxb('1');
    setFormPrecio('');
    setFormStock('0');
    setFormStockMin('5');
    setFormObs('');
    setModalFormulario(true);
  };

  const abrirEdicion = (prod: ProductoItem) => {
    setSeleccionado(null);
    setEditandoId(prod.id);
    setFormCodigo(prod.codigo);
    setFormCategoriaId(prod.categoriaId);
    setFormEje(prod.ejeTexto ?? '');
    setFormAloj(prod.alojTexto ?? '');
    setFormAlt(prod.altTexto ?? '');
    setFormGiro(prod.giro ?? '');
    setFormUxb(String(prod.uxb ?? 1));
    setFormPrecio(prod.precioLista !== null ? String(prod.precioLista) : '');
    setFormStock(String(prod.stock ?? 0));
    setFormStockMin(String(prod.stockMinimo ?? 0));
    setFormObs(prod.observaciones ?? '');
    setModalFormulario(true);
  };

  const guardarProducto = async () => {
    if (!editandoId && !formCodigo.trim()) {
      avisar('El código del producto es obligatorio.', 'advertencia');
      return;
    }
    setGuardando(true);
    try {
      const numOrUndef = (v: string) => {
        const n = Number(v.replace(',', '.'));
        return v.trim() !== '' && Number.isFinite(n) ? n : undefined;
      };
      const cuerpo: Record<string, unknown> = {
        categoria_id: formCategoriaId ?? undefined,
        eje_texto: formEje.trim() || undefined,
        eje_valor: numOrUndef(formEje),
        aloj_texto: formAloj.trim() || undefined,
        aloj_valor: numOrUndef(formAloj),
        alt_texto: formAlt.trim() || undefined,
        alt_valor: numOrUndef(formAlt),
        giro: formGiro.trim() || undefined,
        uxb: numOrUndef(formUxb),
        precio_lista: numOrUndef(formPrecio),
        stock: numOrUndef(formStock) ?? 0,
        stock_minimo: numOrUndef(formStockMin) ?? 0,
        observaciones: formObs.trim() || undefined
      };

      if (editandoId) {
        await peticion(`/productos/${editandoId}`, { metodo: 'PUT', cuerpo });
        avisar('Producto actualizado correctamente.', 'exito');
      } else {
        cuerpo.codigo = formCodigo.trim();
        await peticion('/productos', { metodo: 'POST', cuerpo });
        avisar('Producto creado correctamente.', 'exito');
      }
      setModalFormulario(false);
      await cargarProductos(true);
    } catch (error) {
      avisar(
        error instanceof Error ? error.message : 'No se pudo guardar el producto.',
        'peligro'
      );
    } finally {
      setGuardando(false);
    }
  };

  const eliminarProducto = async (prod: ProductoItem) => {
    const ok = await confirmar({
      titulo: 'Eliminar producto',
      mensaje: `¿Estás seguro de que querés eliminar el producto "${prod.codigo}"? Esta acción no se puede deshacer.`,
      textoAceptar: 'Sí, eliminar',
      textoCancelar: 'Cancelar',
      peligroso: true,
      tipo: 'peligro'
    });
    if (!ok) return;

    try {
      await peticion(`/productos/${prod.id}`, { metodo: 'DELETE' });
      if (seleccionado?.id === prod.id) {
        setSeleccionado(null);
      }
      if (editandoId === prod.id) {
        setModalFormulario(false);
      }
      avisar(`Producto ${prod.codigo} eliminado correctamente.`, 'exito');
      await cargarProductos(true);
    } catch (error) {
      avisar(
        error instanceof Error ? error.message : 'No se pudo eliminar el producto.',
        'peligro'
      );
    }
  };

  return (
    <View style={{ backgroundColor: tokens.fondo }} className="flex-1 bg-fondo">
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 p-5 pb-10"
        refreshControl={
          <RefreshControl
            refreshing={refrescando}
            onRefresh={() => void cargarProductos(true)}
            tintColor={tokens.primario}
          />
        }
      >
        {/* Encabezado */}
        <View className="flex-row flex-wrap items-center justify-between gap-3">
          <View className="flex-row items-center gap-3">
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primario/12">
              <Ionicons name="pricetags-outline" size={24} color={tokens.primario} />
            </View>
            <View>
              <Text className="text-xl font-bold text-texto">Catálogo de Productos</Text>
              <Text className="text-sm text-texto-suave">
                {totalRegistros} artículos encontrados en Stocker
              </Text>
            </View>
          </View>
          <View className="flex-row items-center gap-2">
            <Boton
              titulo={modoMedidas ? 'Búsqueda por texto' : 'Buscar por medidas'}
              icono="resize-outline"
              variante={modoMedidas ? 'primario' : 'contorno'}
              tamano="sm"
              onPress={() => {
                setModoMedidas((v) => !v);
                setPagina(1);
              }}
            />
            {puedeEditar && (
              <Boton
                titulo="Nuevo producto"
                icono="add-circle-outline"
                tamano="sm"
                onPress={abrirNuevo}
              />
            )}
          </View>
        </View>

        {/* Panel de búsqueda */}
        <Tarjeta compacta clase="gap-3">
          {!modoMedidas ? (
            <Entrada
              icono="search-outline"
              placeholder="Buscar por código, aplicación (marca/modelo/motor) o medida…"
              value={busqueda}
              onChangeText={(texto) => {
                setBusqueda(texto);
                setPagina(1);
              }}
            />
          ) : (
            <View className="gap-3">
              <Text className="text-xs font-bold uppercase text-texto-suave">
                Búsqueda dimensional (mm ± tolerancia)
              </Text>
              <View className="flex-row flex-wrap gap-2">
                <Entrada
                  etiqueta="Eje (mm)"
                  placeholder="Ej: 85"
                  keyboardType="numeric"
                  value={eje}
                  onChangeText={setEje}
                  clase="min-w-[110px] flex-1"
                />
                <Entrada
                  etiqueta="Alojamiento (mm)"
                  placeholder="Ej: 105"
                  keyboardType="numeric"
                  value={aloj}
                  onChangeText={setAloj}
                  clase="min-w-[110px] flex-1"
                />
                <Entrada
                  etiqueta="Altura (mm)"
                  placeholder="Ej: 11"
                  keyboardType="numeric"
                  value={alt}
                  onChangeText={setAlt}
                  clase="min-w-[110px] flex-1"
                />
                <Entrada
                  etiqueta="Tolerancia (±)"
                  placeholder="0.5"
                  keyboardType="numeric"
                  value={tolerancia}
                  onChangeText={setTolerancia}
                  clase="min-w-[100px] flex-1"
                />
                <Entrada
                  etiqueta="Giro"
                  placeholder="H / AH / LI"
                  value={giroFiltro}
                  onChangeText={setGiroFiltro}
                  clase="min-w-[100px] flex-1"
                />
              </View>
            </View>
          )}

          {/* Filtro por Categoría */}
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
                Todas las categorías
              </Text>
            </Pressable>
            {categorias.map((cat) => {
              const activa = categoriaId === cat.id;
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => {
                    setCategoriaId(activa ? null : cat.id);
                    setPagina(1);
                  }}
                  className={cn(
                    'rounded-full border px-3 py-1.5',
                    activa ? 'border-primario bg-primario' : 'border-borde bg-superficie-alt'
                  )}
                >
                  <Text
                    className={cn('text-xs font-bold', activa ? 'text-white' : 'text-texto')}
                  >
                    {cat.nombre}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Filtros rápidos */}
          {!modoMedidas && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
              {(
                [
                  { id: 'todos', texto: 'Todos' },
                  { id: 'lanzamiento', texto: 'Lanzamientos' },
                  { id: 'proximo', texto: 'Próximo ingreso' },
                  { id: 'stock_bajo', texto: 'Stock bajo' },
                  { id: 'sin_stock', texto: 'Sin stock' }
                ] as const
              ).map((item) => {
                const activo = filtroRapido === item.id;
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => {
                      setFiltroRapido(item.id);
                      setPagina(1);
                    }}
                    className={cn(
                      'rounded-lg border px-2.5 py-1',
                      activo
                        ? 'border-primario bg-primario/15'
                        : 'border-borde bg-superficie'
                    )}
                  >
                    <Text
                      className={cn(
                        'text-xs font-semibold',
                        activo ? 'text-primario' : 'text-texto-suave'
                      )}
                    >
                      {item.texto}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
        </Tarjeta>

        {/* Listado de productos */}
        {cargando ? (
          <View className="items-center justify-center py-12">
            <ActivityIndicator size="large" color={tokens.primario} />
            <Text className="mt-2 text-sm text-texto-suave">Cargando catálogo…</Text>
          </View>
        ) : productos.length === 0 ? (
          <Tarjeta clase="items-center py-10">
            <Ionicons name="search-outline" size={32} color={tokens.textoSuave} />
            <Text className="mt-2 text-base font-bold text-texto">Sin resultados</Text>
            <Text className="text-center text-sm text-texto-suave">
              No se encontraron retenes con los filtros seleccionados.
            </Text>
          </Tarjeta>
        ) : (
          <View className="gap-3">
            {productos.map((prod) => (
              <Tarjeta key={prod.id} compacta clase="gap-2.5">
                <Pressable onPress={() => void abrirDetalle(prod)} className="gap-2">
                  <View className="flex-row flex-wrap items-start justify-between gap-2">
                    <View className="flex-1">
                      <View className="flex-row flex-wrap items-center gap-2">
                        <Text
                          style={{ color: tokens.primario }}
                          className="text-base font-bold text-primario"
                        >
                          {prod.codigo}
                        </Text>
                        {Boolean(prod.lanzamiento) && (
                          <Insignia texto="LANZAMIENTO" tono="info" />
                        )}
                        {Boolean(prod.proximoIngreso) && (
                          <Insignia texto="PRÓX. INGRESO" tono="advertencia" />
                        )}
                        {!prod.activo && <Insignia texto="INACTIVO" tono="neutro" />}
                      </View>
                      <Text
                        style={{ color: tokens.textoSuave }}
                        className="mt-0.5 text-xs font-semibold text-texto-suave"
                      >
                        {prod.categoriaNombre ?? 'Sin categoría'}
                      </Text>
                    </View>

                    <View className="items-end gap-1">
                      <Text
                        style={{ color: tokens.texto }}
                        className="text-base font-bold text-texto"
                      >
                        {formatearPrecio(prod.precioLista)}
                      </Text>
                      <Insignia
                        texto={`Stock: ${prod.stock} (Mín: ${prod.stockMinimo})`}
                        tono={tonoDeStock(prod.stock, prod.stockMinimo)}
                      />
                    </View>
                  </View>

                  {/* Medidas técnicas */}
                  <View
                    style={{ backgroundColor: tokens.superficieAlt }}
                    className="flex-row flex-wrap items-center gap-3 rounded-xl bg-superficie-alt px-3 py-2"
                  >
                    <Text style={{ color: tokens.texto }} className="text-xs text-texto">
                      <Text className="font-bold">Eje:</Text> {prod.ejeTexto ?? '—'} mm
                    </Text>
                    <Text style={{ color: tokens.texto }} className="text-xs text-texto">
                      <Text className="font-bold">Aloj:</Text> {prod.alojTexto ?? '—'} mm
                    </Text>
                    <Text style={{ color: tokens.texto }} className="text-xs text-texto">
                      <Text className="font-bold">Alt:</Text> {prod.altTexto ?? '—'} mm
                    </Text>
                    {prod.giro ? (
                      <Text style={{ color: tokens.texto }} className="text-xs text-texto">
                        <Text className="font-bold">Giro:</Text> {prod.giro}
                      </Text>
                    ) : null}
                    {prod.uxb ? (
                      <Text style={{ color: tokens.texto }} className="text-xs text-texto">
                        <Text className="font-bold">UxB:</Text> {prod.uxb}
                      </Text>
                    ) : null}
                  </View>

                  {prod.observaciones ? (
                    <Text
                      numberOfLines={2}
                      style={{ color: tokens.textoSuave }}
                      className="text-xs text-texto-suave"
                    >
                      {prod.observaciones}
                    </Text>
                  ) : null}
                </Pressable>

                {/* Botonera de acciones directa en cada producto */}
                <View
                  style={{ borderColor: tokens.borde }}
                  className="flex-row flex-wrap items-center justify-end gap-2 border-t border-borde pt-2"
                >
                  <Boton
                    titulo="Detalle"
                    icono="eye-outline"
                    variante="secundario"
                    tamano="sm"
                    onPress={() => void abrirDetalle(prod)}
                  />
                  <Boton
                    titulo="Editar"
                    icono="create-outline"
                    variante="contorno"
                    tamano="sm"
                    onPress={() => abrirEdicion(prod)}
                  />
                  <Boton
                    titulo="Eliminar"
                    icono="trash-outline"
                    variante="peligro"
                    tamano="sm"
                    onPress={() => void eliminarProducto(prod)}
                  />
                </View>
              </Tarjeta>
            ))}
          </View>
        )}

        {/* Paginación */}
        {!modoMedidas && totalPaginas > 1 && (
          <View className="flex-row items-center justify-between pt-2">
            <Boton
              titulo="Anterior"
              icono="chevron-back-outline"
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
              iconoDerecha="chevron-forward-outline"
              variante="secundario"
              tamano="sm"
              deshabilitado={pagina >= totalPaginas}
              onPress={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
            />
          </View>
        )}
      </ScrollView>

      {/* Modal de Detalle y Equivalencias */}
      <Modal
        visible={Boolean(seleccionado)}
        transparent
        animationType="fade"
        onRequestClose={() => setSeleccionado(null)}
      >
        <View
          style={estiloVariables}
          className={cn(claseRaiz, 'flex-1 items-center justify-center bg-black/50 p-4')}
        >
          <View
            style={{ backgroundColor: tokens.superficie, borderColor: tokens.borde }}
            className="max-h-[90%] w-full max-w-lg rounded-2xl border border-borde bg-superficie p-5"
          >
            {seleccionado && (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="gap-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-xl font-bold text-primario">
                      Código {seleccionado.codigo}
                    </Text>
                    <Text className="text-xs text-texto-suave">
                      {seleccionado.categoriaNombre ?? 'Sin categoría'}
                    </Text>
                  </View>
                  <BotonIcono icono="close" onPress={() => setSeleccionado(null)} />
                </View>

                <View className="gap-2 rounded-xl border border-borde bg-superficie-alt p-3">
                  <Text className="text-sm font-bold text-texto">
                    Precio de lista: {formatearPrecio(seleccionado.precioLista)}
                  </Text>
                  <Text className="text-sm text-texto">
                    Medidas: Eje {seleccionado.ejeTexto ?? '—'} × Aloj {seleccionado.alojTexto ?? '—'}{' '}
                    × Alt {seleccionado.altTexto ?? '—'} mm
                  </Text>
                  <Text className="text-sm text-texto">
                    Giro: {seleccionado.giro ?? '—'} · UxB: {seleccionado.uxb ?? '—'} · Stock:{' '}
                    {seleccionado.stock} (Mín: {seleccionado.stockMinimo})
                  </Text>
                  {seleccionado.observaciones ? (
                    <Text className="mt-1 text-xs leading-5 text-texto-suave">
                      {seleccionado.observaciones}
                    </Text>
                  ) : null}
                </View>

                {/* Equivalencias */}
                <View className="gap-2">
                  <Text className="text-sm font-bold text-texto">
                    Códigos de Equivalencia (OEM / Alternativos / Sustitutos)
                  </Text>
                  {cargandoEquiv ? (
                    <ActivityIndicator size="small" color={tokens.primario} />
                  ) : equivalencias.length === 0 ? (
                    <Text className="text-xs text-texto-suave">
                      Sin equivalencias registradas para este artículo.
                    </Text>
                  ) : (
                    <View className="flex-row flex-wrap gap-2">
                      {equivalencias.map((eq) => (
                        <View
                          key={eq.id}
                          className="flex-row items-center gap-1.5 rounded-lg border border-borde bg-superficie-alt px-2.5 py-1"
                        >
                          <Insignia
                            texto={eq.tipo}
                            tono={eq.tipo === 'OEM' ? 'primario' : eq.tipo === 'A' ? 'info' : 'neutro'}
                          />
                          <Text className="text-xs font-semibold text-texto">{eq.codigo}</Text>
                          {puedeEditar && (
                            <Pressable onPress={() => void borrarEquiv(eq.id)}>
                              <Ionicons name="close-circle" size={16} color={tokens.peligro} />
                            </Pressable>
                          )}
                        </View>
                      ))}
                    </View>
                  )}

                  {puedeEditar && (
                    <View className="mt-2 gap-2 rounded-xl border border-borde p-3">
                      <Text className="text-xs font-bold text-texto-suave">
                        Agregar equivalencia
                      </Text>
                      <View className="flex-row gap-2">
                        {(['OEM', 'A', 'S'] as const).map((t) => (
                          <Pressable
                            key={t}
                            onPress={() => setNuevoTipoEquiv(t)}
                            className={cn(
                              'rounded-lg border px-3 py-1.5',
                              nuevoTipoEquiv === t
                                ? 'border-primario bg-primario'
                                : 'border-borde bg-superficie-alt'
                            )}
                          >
                            <Text
                              className={cn(
                                'text-xs font-bold',
                                nuevoTipoEquiv === t ? 'text-white' : 'text-texto'
                              )}
                            >
                              {t}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                      <View className="flex-row items-center gap-2">
                        <Entrada
                          placeholder="Código equivalente…"
                          value={nuevoCodigoEquiv}
                          onChangeText={setNuevoCodigoEquiv}
                          clase="flex-1"
                        />
                        <Boton
                          titulo="Agregar"
                          tamano="sm"
                          onPress={() => void agregarEquiv()}
                        />
                      </View>
                    </View>
                  )}
                </View>

                <View className="flex-row flex-wrap justify-end gap-2 pt-2">
                  {puedeEditar && (
                    <>
                      <Boton
                        titulo="Eliminar"
                        icono="trash-outline"
                        variante="peligro"
                        onPress={() => void eliminarProducto(seleccionado)}
                      />
                      <Boton
                        titulo="Editar producto"
                        icono="create-outline"
                        variante="secundario"
                        onPress={() => abrirEdicion(seleccionado)}
                      />
                    </>
                  )}
                  <Boton
                    titulo="Cerrar"
                    variante="primario"
                    onPress={() => setSeleccionado(null)}
                  />
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal Crear / Editar Producto */}
      <Modal
        visible={modalFormulario}
        transparent
        animationType="fade"
        onRequestClose={() => setModalFormulario(false)}
      >
        <View
          style={estiloVariables}
          className={cn(claseRaiz, 'flex-1 items-center justify-center bg-black/50 p-4')}
        >
          <View
            style={{ backgroundColor: tokens.superficie, borderColor: tokens.borde }}
            className="max-h-[92%] w-full max-w-lg rounded-2xl border border-borde bg-superficie p-5"
          >
            <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="gap-3">
              <EncabezadoTarjeta
                titulo={editandoId ? 'Editar Producto' : 'Nuevo Producto'}
                icono="pricetags-outline"
              />
              {!editandoId && (
                <Entrada
                  etiqueta="Código *"
                  placeholder="Ej: 11056500"
                  value={formCodigo}
                  onChangeText={setFormCodigo}
                />
              )}
              <View className="flex-row gap-2">
                <Entrada
                  etiqueta="Eje (mm)"
                  placeholder="85"
                  value={formEje}
                  onChangeText={setFormEje}
                  clase="flex-1"
                />
                <Entrada
                  etiqueta="Alojamiento (mm)"
                  placeholder="105"
                  value={formAloj}
                  onChangeText={setFormAloj}
                  clase="flex-1"
                />
                <Entrada
                  etiqueta="Altura (mm)"
                  placeholder="11"
                  value={formAlt}
                  onChangeText={setFormAlt}
                  clase="flex-1"
                />
              </View>
              <View className="flex-row gap-2">
                <Entrada
                  etiqueta="Giro"
                  placeholder="AH / H / LI"
                  value={formGiro}
                  onChangeText={setFormGiro}
                  clase="flex-1"
                />
                <Entrada
                  etiqueta="UxB"
                  keyboardType="numeric"
                  value={formUxb}
                  onChangeText={setFormUxb}
                  clase="flex-1"
                />
                <Entrada
                  etiqueta="Precio Lista ($)"
                  keyboardType="numeric"
                  value={formPrecio}
                  onChangeText={setFormPrecio}
                  clase="flex-1"
                />
              </View>
              <View className="flex-row gap-2">
                <Entrada
                  etiqueta="Stock Actual"
                  keyboardType="numeric"
                  value={formStock}
                  onChangeText={setFormStock}
                  clase="flex-1"
                />
                <Entrada
                  etiqueta="Stock Mínimo"
                  keyboardType="numeric"
                  value={formStockMin}
                  onChangeText={setFormStockMin}
                  clase="flex-1"
                />
              </View>
              <Entrada
                etiqueta="Observaciones / Aplicación"
                placeholder="Marca, modelo y motor…"
                value={formObs}
                onChangeText={setFormObs}
                multiline
              />
              <View className="mt-3 flex-row flex-wrap items-center justify-between gap-2">
                {editandoId ? (
                  <Boton
                    titulo="Eliminar"
                    icono="trash-outline"
                    variante="peligro"
                    onPress={() => {
                      const prod = productos.find((p) => p.id === editandoId);
                      if (prod) {
                        void eliminarProducto(prod);
                      }
                    }}
                  />
                ) : (
                  <View />
                )}
                <View className="flex-row gap-2">
                  <Boton
                    titulo="Cancelar"
                    variante="secundario"
                    onPress={() => setModalFormulario(false)}
                  />
                  <Boton
                    titulo="Guardar"
                    cargando={guardando}
                    onPress={() => void guardarProducto()}
                  />
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/**
 * @file Administración de las categorías y familias del catálogo.
 * @module client/src/pantallas/Categorias
 */

import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Modal, RefreshControl, ScrollView, Text, View } from 'react-native';

import { usePopUps } from '../componentes/popups/PopUpsProvider';
import { Boton, BotonIcono } from '../componentes/ui/Boton';
import { Entrada } from '../componentes/ui/Entrada';
import { Insignia, tonoDeEstado } from '../componentes/ui/Insignia';
import { EncabezadoTarjeta, Tarjeta } from '../componentes/ui/Tarjeta';
import { useSeleccionar } from '../estado/store';
import { peticion } from '../servicios/api';
import { useTema } from '../tema/TemaProvider';
import { cn } from '../utils/cn';

interface CategoriaItem {
  id: number;
  nombre: string;
  slug: string;
  orden: number;
  activo: number;
  total_productos: number;
}

/** Pantalla de gestión de categorías. */
export function Categorias() {
  const { tokens, claseRaiz, estiloVariables } = useTema();
  const { avisar, confirmar } = usePopUps();
  const rol = useSeleccionar((estado) => estado.sesion.usuario?.rol.codigo);
  const esAdmin = rol === 'admin';

  const [categorias, setCategorias] = useState<CategoriaItem[]>([]);
  const [incluirInactivas, setIncluirInactivas] = useState(true);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<CategoriaItem | null>(null);
  const [nombre, setNombre] = useState('');
  const [orden, setOrden] = useState('0');
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(
    async (silencioso = false) => {
      if (!silencioso) setCargando(true);
      else setRefrescando(true);
      try {
        const datos = await peticion<CategoriaItem[]>('/categorias', {
          consulta: { incluirInactivas: incluirInactivas ? 'true' : 'false' }
        });
        setCategorias(datos);
      } catch (error) {
        avisar(
          error instanceof Error ? error.message : 'No se pudieron cargar las categorías.',
          'peligro'
        );
      } finally {
        setCargando(false);
        setRefrescando(false);
      }
    },
    [incluirInactivas, avisar]
  );

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const abrirNueva = () => {
    setEditando(null);
    setNombre('');
    setOrden(String(categorias.length + 1));
    setModalAbierto(true);
  };

  const abrirEdicion = (cat: CategoriaItem) => {
    setEditando(cat);
    setNombre(cat.nombre);
    setOrden(String(cat.orden ?? 0));
    setModalAbierto(true);
  };

  const guardar = async () => {
    if (!nombre.trim()) {
      avisar('El nombre de la categoría es obligatorio.', 'advertencia');
      return;
    }
    setGuardando(true);
    try {
      const ordenNum = Number.parseInt(orden, 10) || 0;
      if (editando) {
        await peticion(`/categorias/${editando.id}`, {
          metodo: 'PUT',
          cuerpo: { nombre: nombre.trim(), orden: ordenNum }
        });
        avisar('Categoría actualizada.', 'exito');
      } else {
        await peticion('/categorias', {
          metodo: 'POST',
          cuerpo: { nombre: nombre.trim(), orden: ordenNum }
        });
        avisar('Categoría creada.', 'exito');
      }
      setModalAbierto(false);
      await cargar(true);
    } catch (error) {
      avisar(
        error instanceof Error ? error.message : 'No se pudo guardar la categoría.',
        'peligro'
      );
    } finally {
      setGuardando(false);
    }
  };

  const alternarActivo = async (cat: CategoriaItem) => {
    try {
      await peticion(`/categorias/${cat.id}`, {
        metodo: 'PUT',
        cuerpo: { activo: Number(cat.activo) !== 1 }
      });
      avisar('Estado actualizado.', 'exito');
      await cargar(true);
    } catch (error) {
      avisar(error instanceof Error ? error.message : 'Error al cambiar el estado.', 'peligro');
    }
  };

  const eliminarCategoria = async (cat: CategoriaItem) => {
    const ok = await confirmar({
      titulo: 'Eliminar categoría',
      mensaje: `¿Seguro que querés eliminar "${cat.nombre}"? Solo se permite si no tiene productos asociados.`,
      peligroso: true
    });
    if (!ok) return;
    try {
      await peticion(`/categorias/${cat.id}`, { metodo: 'DELETE' });
      avisar('Categoría eliminada.', 'exito');
      await cargar(true);
    } catch (error) {
      avisar(
        error instanceof Error ? error.message : 'No se pudo eliminar la categoría.',
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
            onRefresh={() => void cargar(true)}
            tintColor={tokens.primario}
          />
        }
      >
        {/* Encabezado */}
        <View className="flex-row flex-wrap items-center justify-between gap-3">
          <View className="flex-row items-center gap-3">
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primario/12">
              <Ionicons name="grid-outline" size={24} color={tokens.primario} />
            </View>
            <View>
              <Text className="text-xl font-bold text-texto">Categorías del Catálogo</Text>
              <Text className="text-sm text-texto-suave">
                {categorias.length} familias de productos registradas
              </Text>
            </View>
          </View>
          <View className="flex-row items-center gap-2">
            <Boton
              titulo={incluirInactivas ? 'Ocultar inactivas' : 'Ver inactivas'}
              variante="secundario"
              tamano="sm"
              onPress={() => setIncluirInactivas((v) => !v)}
            />
            <Boton
              titulo="Nueva categoría"
              icono="add-circle-outline"
              tamano="sm"
              onPress={abrirNueva}
            />
          </View>
        </View>

        {cargando ? (
          <View className="items-center py-12">
            <ActivityIndicator size="large" color={tokens.primario} />
          </View>
        ) : (
          <View className="gap-3">
            {categorias.map((cat) => (
              <Tarjeta
                key={cat.id}
                compacta
                clase="flex-row flex-wrap items-center justify-between gap-3"
              >
                <View className="min-w-[200px] flex-1 gap-1">
                  <View className="flex-row items-center gap-2">
                    <Insignia texto={`#${cat.orden}`} tono="primario" />
                    <Text className="text-base font-bold text-texto">{cat.nombre}</Text>
                  </View>
                  <Text className="text-xs text-texto-suave">
                    Slug: {cat.slug} · {cat.total_productos ?? 0} productos asociados
                  </Text>
                </View>

                <View className="flex-row items-center gap-2">
                  <Insignia
                    texto={Number(cat.activo) === 1 ? 'ACTIVA' : 'INACTIVA'}
                    tono={tonoDeEstado(cat.activo)}
                  />
                  <BotonIcono
                    icono="create-outline"
                    onPress={() => abrirEdicion(cat)}
                    accessibilityLabel="Editar categoría"
                  />
                  <BotonIcono
                    icono={Number(cat.activo) === 1 ? 'pause-circle-outline' : 'play-circle-outline'}
                    onPress={() => void alternarActivo(cat)}
                    accessibilityLabel="Cambiar estado"
                  />
                  {esAdmin && (
                    <BotonIcono
                      icono="trash-outline"
                      color={tokens.peligro}
                      onPress={() => void eliminarCategoria(cat)}
                      accessibilityLabel="Eliminar categoría"
                    />
                  )}
                </View>
              </Tarjeta>
            ))}
          </View>
        )}
      </ScrollView>

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
            className="w-full max-w-md rounded-2xl border border-borde bg-superficie p-5"
          >
            <EncabezadoTarjeta
              titulo={editando ? 'Editar Categoría' : 'Nueva Categoría'}
              icono="grid-outline"
            />
            <View className="gap-3">
              <Entrada
                etiqueta="Nombre *"
                placeholder="Ej: RETENES CONVENCIONALES"
                value={nombre}
                onChangeText={setNombre}
              />
              <Entrada
                etiqueta="Orden de visualización"
                keyboardType="numeric"
                value={orden}
                onChangeText={setOrden}
              />
              <View className="mt-3 flex-row justify-end gap-2">
                <Boton
                  titulo="Cancelar"
                  variante="secundario"
                  onPress={() => setModalAbierto(false)}
                />
                <Boton titulo="Guardar" cargando={guardando} onPress={() => void guardar()} />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

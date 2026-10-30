/**
 * @file Selector desplegable propio (no usa `Picker` nativo ni Alert). Se
 *       implementa con un Modal + lista, con soporte de búsqueda opcional.
 * @module client/src/componentes/ui/Selector
 */

import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, Text, View } from 'react-native';

import { Boton } from './Boton';
import { Entrada } from './Entrada';
import { cn } from '../../utils/cn';
import { useTema } from '../../tema/TemaProvider';

/** Una opción del selector. */
export interface OpcionSelector<T extends string | number = string> {
  /** Valor asociado. */
  valor: T;
  /** Texto visible. */
  etiqueta: string;
  /** Descripción secundaria. */
  descripcion?: string;
}

/** Propiedades del selector. */
export interface SelectorProps<T extends string | number = string> {
  /** Etiqueta superior. */
  etiqueta?: string;
  /** Texto cuando no hay valor. */
  marcador?: string;
  /** Opciones disponibles. */
  opciones: ReadonlyArray<OpcionSelector<T>>;
  /** Valor seleccionado. */
  valor: T | null | undefined;
  /** Cambio de valor. */
  onCambiar: (valor: T) => void;
  /** Mensaje de error. */
  error?: string;
  /** Habilita el buscador dentro de la lista. */
  buscable?: boolean;
  /** Permite limpiar la selección. */
  permitirLimpiar?: boolean;
  /** Clases adicionales. */
  clase?: string;
}

/** Desplegable accesible con lista modal. */
export function Selector<T extends string | number = string>({
  etiqueta,
  marcador = 'Seleccionar...',
  opciones,
  valor,
  onCambiar,
  error,
  buscable = false,
  permitirLimpiar = false,
  clase
}: SelectorProps<T>) {
  const { tokens } = useTema();
  const [abierto, setAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  const seleccionada = useMemo(
    () => opciones.find((opcion) => opcion.valor === valor) ?? null,
    [opciones, valor]
  );

  const filtradas = useMemo(() => {
    if (!buscable || !busqueda.trim()) return opciones;
    const termino = busqueda.trim().toLowerCase();
    return opciones.filter(
      (opcion) =>
        opcion.etiqueta.toLowerCase().includes(termino) ||
        (opcion.descripcion ?? '').toLowerCase().includes(termino)
    );
  }, [buscable, busqueda, opciones]);

  return (
    <View className={cn('w-full', clase)}>
      {etiqueta && <Text className="mb-1.5 text-sm font-semibold text-texto-suave">{etiqueta}</Text>}
      <Pressable
        accessibilityRole="button"
        onPress={() => setAbierto(true)}
        className={cn(
          'flex-row items-center justify-between gap-2 rounded-xl border bg-superficie px-3 py-3',
          error ? 'border-peligro' : 'border-borde'
        )}
      >
        <Text
          numberOfLines={1}
          className={cn('flex-1 text-base', seleccionada ? 'text-texto' : 'text-texto-suave')}
        >
          {seleccionada ? seleccionada.etiqueta : marcador}
        </Text>
        <Ionicons name="chevron-down" size={18} color={tokens.textoSuave} />
      </Pressable>
      {error && <Text className="mt-1 text-xs text-peligro">{error}</Text>}

      <Modal visible={abierto} transparent animationType="fade" onRequestClose={() => setAbierto(false)}>
        <Pressable
          className="flex-1 items-center justify-center bg-black/50 p-4"
          onPress={() => setAbierto(false)}
        >
          <Pressable
            className="max-h-[70%] w-full max-w-lg rounded-2xl border border-borde bg-superficie p-4"
            onPress={(evento) => evento.stopPropagation()}
          >
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-lg font-bold text-texto">{etiqueta ?? 'Seleccionar'}</Text>
              <Pressable accessibilityRole="button" onPress={() => setAbierto(false)}>
                <Ionicons name="close" size={22} color={tokens.textoSuave} />
              </Pressable>
            </View>

            {buscable && (
              <View className="mb-3">
                <Entrada
                  icono="search"
                  placeholder="Buscar..."
                  value={busqueda}
                  onChangeText={setBusqueda}
                  autoCorrect={false}
                />
              </View>
            )}

            <FlatList
              data={filtradas}
              keyExtractor={(item) => String(item.valor)}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const activa = item.valor === valor;
                return (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      onCambiar(item.valor);
                      setAbierto(false);
                      setBusqueda('');
                    }}
                    className={cn(
                      'flex-row items-center justify-between gap-2 rounded-xl px-3 py-3',
                      activa ? 'bg-primario/15' : 'active:bg-superficie-alt'
                    )}
                  >
                    <View className="flex-1">
                      <Text className={cn('text-base', activa ? 'font-bold text-primario' : 'text-texto')}>
                        {item.etiqueta}
                      </Text>
                      {item.descripcion && (
                        <Text className="text-xs text-texto-suave">{item.descripcion}</Text>
                      )}
                    </View>
                    {activa && <Ionicons name="checkmark-circle" size={20} color={tokens.primario} />}
                  </Pressable>
                );
              }}
              ListEmptyComponent={
                <Text className="py-6 text-center text-sm text-texto-suave">Sin opciones</Text>
              }
            />

            {permitirLimpiar && (
              <View className="mt-3">
                <Boton
                  titulo="Limpiar selección"
                  variante="texto"
                  tamano="sm"
                  icono="close-circle-outline"
                  onPress={() => {
                    onCambiar(null as unknown as T);
                    setAbierto(false);
                  }}
                />
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

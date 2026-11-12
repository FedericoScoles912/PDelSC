/**
 * @file Contenedor de desplazamiento para las secciones de la aplicación.
 *       Muestra automáticamente:
 *       1) Un buscador flotante fijo en la parte superior cuando el usuario
 *          baja y se aparta del encabezado principal (si la sección tiene buscador),
 *          volviendo al buscador normal al regresar al tope.
 *       2) Un botón flotante ("Ir al tope") en la esquina inferior derecha que
 *          lleva instantáneamente al inicio de la sección.
 * @module client/src/componentes/ui/ContenedorScrollSeccion
 */

import { Ionicons } from '@expo/vector-icons';
import { useCallback, useRef, useState, type ReactNode } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollViewProps
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTema } from '../../tema/TemaProvider';
import { cn } from '../../utils/cn';

/** Configuración del buscador de la sección para su versión flotante. */
export interface ConfigBuscadorFlotante {
  /** Valor actual del texto de búsqueda. */
  valor: string;
  /** Callback al modificar el texto de búsqueda. */
  onCambiarTexto: (texto: string) => void;
  /** Placeholder del campo de búsqueda. */
  placeholder?: string;
  /** Elemento opcional a la derecha dentro del buscador flotante. */
  accionExtra?: ReactNode;
}

/** Propiedades de {@link ContenedorScrollSeccion}. */
export interface ContenedorScrollSeccionProps extends Omit<ScrollViewProps, 'children'> {
  /** Contenido de la sección. Puede ser ReactNode o función que recibe `fueraDelTope`. */
  children: ReactNode | ((estado: { fueraDelTope: boolean; irAlTope: () => void }) => ReactNode);
  /** Configuración opcional del buscador que se vuelve flotante al bajar. */
  buscador?: ConfigBuscadorFlotante;
  /** Contenido personalizado opcional para la barra flotante superior. */
  contenidoFlotante?: ReactNode;
  /** Píxeles de desplazamiento vertical para activar el modo flotante (por defecto 120). */
  umbral?: number;
  /** Clases adicionales del contenedor externo. */
  contenedorClassName?: string;
}

/**
 * Envuelve el `ScrollView` de una sección agregando buscador flotante al bajar
 * y botón de regreso instantáneo al tope.
 */
export function ContenedorScrollSeccion({
  children,
  buscador,
  contenidoFlotante,
  umbral = 120,
  contenedorClassName,
  onScroll,
  className,
  contentContainerClassName,
  ...restoProps
}: ContenedorScrollSeccionProps) {
  const { tokens, esOscuro } = useTema();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<{ scrollTo?: (opciones: { x?: number; y?: number; animated?: boolean }) => void } | null>(null);
  const [fueraDelTope, setFueraDelTope] = useState(false);

  const manejarScroll = useCallback(
    (evento: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = evento.nativeEvent.contentOffset.y;
      const superoUmbral = offsetY > umbral;
      setFueraDelTope((previo) => (previo !== superoUmbral ? superoUmbral : previo));
      onScroll?.(evento);
    },
    [umbral, onScroll]
  );

  const irAlTope = useCallback(() => {
    scrollRef.current?.scrollTo?.({ y: 0, animated: false });
    setFueraDelTope(false);
  }, []);

  return (
    <View
      style={{ flex: 1, backgroundColor: tokens.fondo }}
      className={cn('relative flex-1 bg-fondo', contenedorClassName)}
    >
      {/* Buscador flotante fijo al bajar */}
      {fueraDelTope && (buscador || contenidoFlotante) && (
        <View
          style={{
            position: 'absolute',
            top: 10,
            left: 16,
            right: 16,
            zIndex: 40,
            backgroundColor: tokens.superficie,
            borderColor: tokens.primario,
            shadowColor: '#000',
            shadowOpacity: 0.24,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 },
            elevation: 8
          }}
          className="rounded-2xl border-2 px-3.5 py-2"
        >
          {contenidoFlotante ? (
            contenidoFlotante
          ) : buscador ? (
            <View className="flex-row items-center gap-2.5">
              <Ionicons name="search-outline" size={18} color={tokens.primario} />
              <TextInput
                style={
                  {
                    color: tokens.texto,
                    minWidth: 0,
                    width: '100%',
                    flex: 1,
                    outlineStyle: 'none'
                  } as any
                }
                className="min-h-[36px] min-w-0 flex-1 py-1 text-sm text-texto"
                placeholder={buscador.placeholder ?? 'Buscar en esta sección…'}
                placeholderTextColor={tokens.textoSuave}
                value={buscador.valor}
                onChangeText={buscador.onCambiarTexto}
              />
              {buscador.valor.length > 0 && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Limpiar búsqueda"
                  onPress={() => buscador.onCambiarTexto('')}
                  className="p-1"
                >
                  <Ionicons name="close-circle" size={18} color={tokens.textoSuave} />
                </Pressable>
              )}
              {buscador.accionExtra}
            </View>
          ) : null}
        </View>
      )}

      <ScrollView
        ref={scrollRef as any}
        onScroll={manejarScroll}
        scrollEventThrottle={16}
        className={cn('flex-1', className)}
        contentContainerClassName={contentContainerClassName}
        {...restoProps}
      >
        {typeof children === 'function' ? children({ fueraDelTope, irAlTope }) : children}
      </ScrollView>

      {/* Botón flotante para volver instantáneamente al tope */}
      {fueraDelTope && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver instantáneamente al tope"
          onPress={irAlTope}
          style={{
            position: 'absolute',
            right: 20,
            bottom: Platform.OS === 'web' ? 24 : Math.max(insets.bottom + 18, 28),
            zIndex: 50,
            backgroundColor: tokens.primario,
            borderColor: tokens.primarioSuave,
            shadowColor: '#000',
            shadowOpacity: 0.3,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
            elevation: 9
          }}
          className="flex-row items-center gap-1.5 rounded-full border px-4 py-3 active:opacity-90"
        >
          <Ionicons name="arrow-up" size={18} color={esOscuro ? tokens.fondo : '#FFFFFF'} />
          <Text
            style={{ color: esOscuro ? tokens.fondo : '#FFFFFF' }}
            className="text-xs font-bold"
          >
            Ir al tope
          </Text>
        </Pressable>
      )}
    </View>
  );
}

/**
 * @file Barra lateral de navegación. En escritorio queda fija a la izquierda;
 *       entre 768 y 992 px se muestra sólo con iconos para no desbordar.
 * @module client/src/navegacion/BarraLateral
 */

import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { usePopUps } from '../componentes/popups/PopUpsProvider';
import { BotonIcono } from '../componentes/ui/Boton';
import { Insignia, tonoDeRol } from '../componentes/ui/Insignia';
import { cerrarSesion } from '../estado/sesionSlice';
import { useDespacho, useSeleccionar } from '../estado/store';
import { useTema } from '../tema/TemaProvider';
import { cn } from '../utils/cn';
import { ORDEN_GRUPOS, type ItemMenu } from './menu';
import type { RutasApp } from './tipos';

/** Propiedades de la barra lateral. */
export interface BarraLateralProps {
  /** Ítems visibles para el rol activo. */
  items: ItemMenu[];
  /** Ruta actualmente seleccionada. */
  activa: string;
  /** Muestra sólo iconos. */
  compacta: boolean;
  /** Notifica la selección de un módulo. */
  onSeleccionar: (ruta: keyof RutasApp) => void;
  /** Muestra el botón de cierre (usada en el panel móvil). */
  onCerrar?: () => void;
}

/** Iniciales del usuario para el avatar. */
function iniciales(nombre: string, apellido: string | null): string {
  const primera = nombre.trim().charAt(0);
  const segunda = (apellido ?? '').trim().charAt(0);
  return `${primera}${segunda}`.toUpperCase() || '?';
}

/** Barra lateral con marca, menú por rol y bloque de cuenta. */
export function BarraLateral({
  items,
  activa,
  compacta,
  onSeleccionar,
  onCerrar
}: BarraLateralProps) {
  const { tokens, esOscuro, alternar } = useTema();
  const usuario = useSeleccionar((estado) => estado.sesion.usuario);
  const despachar = useDespacho();
  const { confirmar, avisar } = usePopUps();

  const grupos = useMemo(
    () =>
      ORDEN_GRUPOS.map((grupo) => ({
        grupo,
        elementos: items.filter((item) => item.grupo === grupo)
      })).filter((seccion) => seccion.elementos.length > 0),
    [items]
  );

  const salir = async () => {
    const aceptado = await confirmar({
      titulo: 'Cerrar sesión',
      mensaje: '¿Querés cerrar la sesión actual?',
      textoAceptar: 'Cerrar sesión',
      peligroso: true
    });
    if (!aceptado) return;
    await despachar(cerrarSesion());
    avisar('Sesión cerrada correctamente.', 'exito');
  };

  return (
    <View
      className={cn(
        'h-full border-r border-borde bg-superficie',
        compacta ? 'w-sidebar-mini' : 'w-sidebar'
      )}
    >
      {/* Marca */}
      <View
        className={cn(
          'h-topbar flex-row items-center gap-3 border-b border-borde px-4',
          compacta && 'justify-center px-2'
        )}
      >
        <View className="h-9 w-9 items-center justify-center rounded-xl bg-primario">
          <Ionicons name="aperture-outline" size={20} color={tokens.sobrePrimario} />
        </View>
        {!compacta && (
          <View className="flex-1">
            <Text numberOfLines={1} className="text-base font-bold text-texto">
              Retenes EMIC
            </Text>
            <Text numberOfLines={1} className="text-xs text-texto-suave">
              Control de stock
            </Text>
          </View>
        )}
        {onCerrar && <BotonIcono icono="close" onPress={onCerrar} color={tokens.textoSuave} />}
      </View>

      {/* Menú */}
      <ScrollView
        className="flex-1"
        contentContainerClassName="py-3"
        showsVerticalScrollIndicator={false}
      >
        {grupos.map((seccion) => (
          <View key={seccion.grupo} className="mb-2">
            {!compacta && (
              <Text className="mb-1 px-4 text-[11px] font-bold uppercase tracking-wider text-texto-suave">
                {seccion.grupo}
              </Text>
            )}
            {seccion.elementos.map((item) => {
              const activo = item.ruta === activa;
              return (
                <Pressable
                  key={item.ruta}
                  accessibilityRole="button"
                  accessibilityLabel={item.titulo}
                  accessibilityState={{ selected: activo }}
                  onPress={() => onSeleccionar(item.ruta)}
                  className={cn(
                    'mx-2 mb-1 flex-row items-center gap-3 overflow-hidden rounded-xl py-2.5',
                    compacta ? 'justify-center px-2' : 'px-3',
                    activo ? 'bg-primario/12' : 'active:bg-superficie-alt'
                  )}
                >
                  {activo && (
                    <View className="absolute bottom-2 left-0 top-2 w-1 rounded-r-full bg-primario" />
                  )}
                  <Ionicons
                    name={item.icono}
                    size={20}
                    color={activo ? tokens.primario : tokens.textoSuave}
                  />
                  {!compacta && (
                    <Text
                      numberOfLines={1}
                      className={cn(
                        'min-w-0 flex-1 text-sm',
                        activo ? 'font-bold text-primario' : 'font-medium text-texto'
                      )}
                    >
                      {item.titulo}
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        ))}
      </ScrollView>

      {/* Cuenta */}
      <View className="border-t border-borde p-3">
        <View className={cn('flex-row items-center gap-3', compacta && 'justify-center')}>
          <View className="h-9 w-9 items-center justify-center rounded-full bg-primario/15">
            <Text className="text-xs font-bold text-primario">
              {iniciales(usuario?.nombre ?? '', usuario?.apellido ?? null)}
            </Text>
          </View>
          {!compacta && (
            <View className="min-w-0 flex-1">
              <Text numberOfLines={1} className="text-sm font-semibold text-texto">
                {usuario ? `${usuario.nombre} ${usuario.apellido ?? ''}`.trim() : 'Sin sesión'}
              </Text>
              <View className="mt-0.5">
                <Insignia
                  texto={usuario?.rol.nombre ?? '—'}
                  tono={tonoDeRol(usuario?.rol.codigo)}
                />
              </View>
            </View>
          )}
        </View>

        <View
          className={cn(
            'mt-3 flex-row items-center',
            compacta ? 'justify-center gap-1' : 'justify-between'
          )}
        >
          <BotonIcono
            icono={esOscuro ? 'sunny-outline' : 'moon-outline'}
            onPress={alternar}
            accessibilityLabel={esOscuro ? 'Activar tema claro' : 'Activar tema oscuro'}
            color={tokens.textoSuave}
          />
          <BotonIcono
            icono="log-out-outline"
            onPress={() => void salir()}
            accessibilityLabel="Cerrar sesión"
            color={tokens.peligro}
          />
        </View>
      </View>
    </View>
  );
}

/**
 * @file Marco de la aplicación autenticada. Mantiene la barra lateral fija en
 *       escritorio y la convierte en un panel deslizable en pantallas chicas,
 *       de modo que nunca haya desbordamiento horizontal.
 * @module client/src/navegacion/MarcoApp
 */

import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState, type ReactNode } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BotonIcono } from '../componentes/ui/Boton';
import { useSeleccionar } from '../estado/store';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { useTema } from '../tema/TemaProvider';
import { cn } from '../utils/cn';
import { BarraLateral } from './BarraLateral';
import { itemDeRuta, itemsPermitidos } from './menu';
import type { RutasApp } from './tipos';

/** Propiedades del marco. */
export interface MarcoAppProps {
  /** Ruta activa dentro de la pila de módulos. */
  activa: string;
  /** Navega a otro módulo. */
  onNavegar: (ruta: keyof RutasApp) => void;
  /** Contenido del módulo activo. */
  children: ReactNode;
}

/** Contenedor de la aplicación autenticada con navegación adaptativa. */
export function MarcoApp({ activa, onNavegar, children }: MarcoAppProps) {
  const { usarSidebar, sidebarCompacta } = useBreakpoint();
  const { tokens } = useTema();
  const usuario = useSeleccionar((estado) => estado.sesion.usuario);
  const [menuAbierto, setMenuAbierto] = useState(false);

  const items = useMemo(() => itemsPermitidos(usuario?.rol.codigo), [usuario?.rol.codigo]);
  const activo = itemDeRuta(activa);

  const seleccionar = (ruta: keyof RutasApp) => {
    onNavegar(ruta);
    setMenuAbierto(false);
  };

  if (usarSidebar) {
    return (
      <View className="flex-1 flex-row bg-fondo">
        <BarraLateral
          items={items}
          activa={activa}
          compacta={sidebarCompacta}
          onSeleccionar={seleccionar}
        />
        <View className="min-w-0 flex-1">{children}</View>
      </View>
    );
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-fondo">
      {/* Barra superior móvil */}
      <View className="h-topbar flex-row items-center gap-3 border-b border-borde bg-superficie px-3">
        <BotonIcono
          icono="menu-outline"
          tamano={24}
          onPress={() => setMenuAbierto(true)}
          accessibilityLabel="Abrir menú de navegación"
          color={tokens.texto}
        />
        <Text numberOfLines={1} className="min-w-0 flex-1 text-base font-bold text-texto">
          {activo?.titulo ?? 'Retenes EMIC'}
        </Text>
      </View>

      <View className="min-w-0 flex-1">{children}</View>

      {/* Panel de navegación */}
      <Modal
        visible={menuAbierto}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuAbierto(false)}
      >
        <View className="flex-1 flex-row bg-black/50">
          <SafeAreaView edges={['top', 'bottom', 'left']} className={cn('h-full bg-superficie')}>
            <BarraLateral
              items={items}
              activa={activa}
              compacta={false}
              onSeleccionar={seleccionar}
              onCerrar={() => setMenuAbierto(false)}
            />
          </SafeAreaView>
          <Pressable
            className="flex-1"
            accessibilityLabel="Cerrar menú de navegación"
            onPress={() => setMenuAbierto(false)}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/**
 * @file Navegación raíz. Decide entre la verificación de sesión, el inicio de
 *       sesión y la aplicación autenticada, y aplica el tema activo a toda la
 *       navegación.
 * @module client/src/navegacion/NavegacionRaiz
 */

import { DefaultTheme, NavigationContainer, type Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useMemo } from 'react';

import { restaurarSesion } from '../estado/sesionSlice';
import { useDespacho, useSeleccionar } from '../estado/store';
import { CargaInicial } from '../pantallas/CargaInicial';
import { InicioSesion } from '../pantallas/InicioSesion';
import { useTema } from '../tema/TemaProvider';
import { NavegacionApp } from './NavegacionApp';
import type { RutasRaiz } from './tipos';

const Raiz = createNativeStackNavigator<RutasRaiz>();

/** Navegación completa de la aplicación. */
export function NavegacionRaiz() {
  const { esOscuro, tokens } = useTema();
  const despachar = useDespacho();
  const estado = useSeleccionar((estadoRaiz) => estadoRaiz.sesion.estado);

  useEffect(() => {
    void despachar(restaurarSesion());
  }, [despachar]);

  const tema = useMemo<Theme>(
    () => ({
      dark: esOscuro,
      colors: {
        primary: tokens.primario,
        background: tokens.fondo,
        card: tokens.superficie,
        text: tokens.texto,
        border: tokens.borde,
        notification: tokens.peligro
      },
      fonts: DefaultTheme.fonts
    }),
    [esOscuro, tokens]
  );

  return (
    <NavigationContainer theme={tema}>
      <Raiz.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        {estado === 'inicial' && <Raiz.Screen name="Carga" component={CargaInicial} />}
        {estado === 'anonimo' && <Raiz.Screen name="InicioSesion" component={InicioSesion} />}
        {estado === 'autenticado' && <Raiz.Screen name="App" component={NavegacionApp} />}
      </Raiz.Navigator>
    </NavigationContainer>
  );
}

/**
 * @file Pantalla de inicio de sesión con email y contraseña.
 *       No usa `alert()` ni `Alert.alert`: los avisos pasan por el sistema
 *       propio de pop-ups.
 * @module client/src/pantallas/InicioSesion
 */

import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';

import { usePopUps } from '../componentes/popups/PopUpsProvider';
import { Boton, BotonIcono } from '../componentes/ui/Boton';
import { Entrada } from '../componentes/ui/Entrada';
import { Tarjeta } from '../componentes/ui/Tarjeta';
import { iniciarSesion } from '../estado/sesionSlice';
import { useDespacho, useSeleccionar } from '../estado/store';
import { useTema } from '../tema/TemaProvider';

/** Formulario de acceso. */
export function InicioSesion() {
  const { tokens, esOscuro, alternar } = useTema();
  const despachar = useDespacho();
  const { avisar } = usePopUps();
  const cargando = useSeleccionar((estado) => estado.sesion.cargando);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorEmail, setErrorEmail] = useState<string | null>(null);
  const [errorPassword, setErrorPassword] = useState<string | null>(null);

  const validar = (): boolean => {
    const correo = email.trim();
    let valido = true;

    if (!correo) {
      setErrorEmail('Ingresá tu correo electrónico.');
      valido = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      setErrorEmail('El correo no parece válido.');
      valido = false;
    } else {
      setErrorEmail(null);
    }

    if (!password) {
      setErrorPassword('Ingresá tu contraseña.');
      valido = false;
    } else {
      setErrorPassword(null);
    }

    return valido;
  };

  const enviar = async () => {
    if (cargando || !validar()) return;
    const resultado = await despachar(iniciarSesion({ email: email.trim(), password }));
    if (iniciarSesion.rejected.match(resultado)) {
      avisar(resultado.payload ?? 'No se pudo iniciar sesión.', 'peligro');
    }
  };

  return (
    <View className="flex-1 bg-fondo">
      <View className="absolute right-3 top-3 z-10">
        <BotonIcono
          icono={esOscuro ? 'sunny-outline' : 'moon-outline'}
          onPress={alternar}
          accessibilityLabel={esOscuro ? 'Activar tema claro' : 'Activar tema oscuro'}
          color={tokens.textoSuave}
        />
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="flex-grow items-center justify-center p-6"
          keyboardShouldPersistTaps="handled"
        >
          <View className="w-full max-w-md gap-6">
            <View className="items-center gap-3">
              <View className="h-16 w-16 items-center justify-center rounded-3xl bg-primario">
                <Ionicons name="aperture-outline" size={34} color={tokens.sobrePrimario} />
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-texto">Retenes EMIC</Text>
                <Text className="text-sm text-texto-suave">Sistema de control de stock</Text>
              </View>
            </View>

            <Tarjeta clase="gap-4">
              <Text className="text-lg font-bold text-texto">Iniciar sesión</Text>

              <Entrada
                etiqueta="Correo electrónico"
                icono="mail-outline"
                placeholder="usuario@retenes.com"
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                textContentType="emailAddress"
                value={email}
                error={errorEmail ?? undefined}
                onChangeText={(nuevo) => {
                  setEmail(nuevo);
                  if (errorEmail) setErrorEmail(null);
                }}
              />

              <Entrada
                etiqueta="Contraseña"
                icono="lock-closed-outline"
                placeholder="Tu contraseña"
                autoCapitalize="none"
                autoComplete="current-password"
                textContentType="password"
                secureTextEntry
                value={password}
                error={errorPassword ?? undefined}
                onSubmitEditing={() => void enviar()}
                returnKeyType="go"
                onChangeText={(nuevo) => {
                  setPassword(nuevo);
                  if (errorPassword) setErrorPassword(null);
                }}
              />

              <Boton
                titulo="Ingresar"
                icono="log-in-outline"
                anchoCompleto
                cargando={cargando}
                onPress={() => void enviar()}
              />
            </Tarjeta>

            <Text className="text-center text-xs text-texto-suave">
              El acceso también está disponible con Google, Facebook o GitHub.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

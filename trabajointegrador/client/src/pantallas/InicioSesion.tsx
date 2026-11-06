/**
 * @file Pantalla de inicio de sesión con email/contraseña y acceso OAuth 2.0 real
 *       (Google, GitHub y Facebook).
 *       No usa `alert()` ni `Alert.alert`: los avisos pasan por el sistema
 *       propio de pop-ups.
 * @module client/src/pantallas/InicioSesion
 */

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View
} from 'react-native';

import { usePopUps } from '../componentes/popups/PopUpsProvider';
import { Boton, BotonIcono } from '../componentes/ui/Boton';
import { Entrada } from '../componentes/ui/Entrada';
import { Tarjeta } from '../componentes/ui/Tarjeta';
import { completarSesionOAuth, iniciarSesion } from '../estado/sesionSlice';
import { useDespacho, useSeleccionar } from '../estado/store';
import type { SesionIniciada } from '../estado/tipos';
import { URL_API, descubrirUrlDisponible, peticion } from '../servicios/api';
import { useTema } from '../tema/TemaProvider';
import { cn } from '../utils/cn';
import { RecuperarContrasena } from './RecuperarContrasena';

type ProveedorOAuth = 'google' | 'github' | 'facebook';

interface InfoProveedor {
  id: ProveedorOAuth;
  nombre: string;
  icono: keyof typeof Ionicons.glyphMap;
  color: string;
}

const PROVEEDORES_SOCIALES: InfoProveedor[] = [
  {
    id: 'google',
    nombre: 'Google',
    icono: 'logo-google',
    color: '#DB4437'
  },
  {
    id: 'github',
    nombre: 'GitHub',
    icono: 'logo-github',
    color: '#24292F'
  },
  {
    id: 'facebook',
    nombre: 'Facebook',
    icono: 'logo-facebook',
    color: '#1877F2'
  }
];

interface RespuestaEstadoOAuth {
  estado: 'pendiente' | 'completado' | 'error' | 'no_encontrado';
  sesion?: SesionIniciada;
  mensaje?: string;
}

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
  const [oauthEnCurso, setOauthEnCurso] = useState<ProveedorOAuth | null>(null);
  const [recuperando, setRecuperando] = useState(false);
  const intervaloRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const detenerPolling = () => {
    if (intervaloRef.current) {
      clearInterval(intervaloRef.current);
      intervaloRef.current = null;
    }
  };

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const escucharMensaje = (evento: MessageEvent) => {
      const data = evento.data as {
        tipo?: string;
        sesion?: SesionIniciada;
      } | null;
      if (data?.tipo === 'STOCKER_OAUTH_EXITO' && data.sesion) {
        detenerPolling();
        setOauthEnCurso(null);
        void despachar(completarSesionOAuth(data.sesion));
        avisar(`Bienvenido, ${data.sesion.usuario.nombre}.`, 'exito');
      }
    };
    window.addEventListener('message', escucharMensaje);
    return () => {
      window.removeEventListener('message', escucharMensaje);
      detenerPolling();
    };
  }, [despachar, avisar]);

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

  const iniciarOAuthReal = async (info: InfoProveedor) => {
    if (cargando || oauthEnCurso) return;
    detenerPolling();
    setOauthEnCurso(info.id);

    try {
      const baseActiva = (await descubrirUrlDisponible(true)) ?? URL_API;
      const state = `stocker_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      const urlInicio = `${baseActiva}/auth/oauth/${info.id}/iniciar?state=${encodeURIComponent(state)}`;

      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const ancho = 540;
        const alto = 680;
        const izq = Math.max(0, (window.screen.width - ancho) / 2);
        const arr = Math.max(0, (window.screen.height - alto) / 2);
        window.open(
          urlInicio,
          `oauth_${info.id}`,
          `width=${ancho},height=${alto},left=${izq},top=${arr},resizable=yes,scrollbars=yes`
        );
      } else {
        try {
          const directo = await peticion<RespuestaEstadoOAuth>(
            `/auth/oauth/estado/${state}?proveedor=${info.id}`,
            { autenticada: false }
          );
          if (directo.estado === 'completado' && directo.sesion) {
            setOauthEnCurso(null);
            await despachar(completarSesionOAuth(directo.sesion));
            avisar(
              `Sesión iniciada con ${info.nombre} (${directo.sesion.usuario.email}).`,
              'exito'
            );
            return;
          }
        } catch {
          /* continúa con navegador externo */
        }
        await Linking.openURL(urlInicio);
      }

      let intentos = 0;
      intervaloRef.current = setInterval(() => {
        intentos += 1;
        if (intentos > 120) {
          detenerPolling();
          setOauthEnCurso(null);
          return;
        }
        void (async () => {
          try {
            const resp = await peticion<RespuestaEstadoOAuth>(`/auth/oauth/estado/${state}`, {
              autenticada: false
            });
            if (resp.estado === 'completado' && resp.sesion) {
              detenerPolling();
              setOauthEnCurso(null);
              await despachar(completarSesionOAuth(resp.sesion));
              avisar(`Sesión iniciada con ${info.nombre} (${resp.sesion.usuario.email}).`, 'exito');
            } else if (resp.estado === 'error') {
              detenerPolling();
              setOauthEnCurso(null);
              avisar(
                resp.mensaje ?? `No se pudo autenticar con ${info.nombre}.`,
                'peligro'
              );
            }
          } catch {
            /* continuar esperando callback */
          }
        })();
      }, 1500);
    } catch (error) {
      detenerPolling();
      setOauthEnCurso(null);
      avisar(
        error instanceof Error ? error.message : `No se pudo abrir ${info.nombre}.`,
        'peligro'
      );
    }
  };

  return (
    <View style={{ backgroundColor: tokens.fondo }} className="flex-1 bg-fondo">
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
              <View
                style={{ backgroundColor: tokens.primario }}
                className="h-16 w-16 items-center justify-center rounded-3xl bg-primario"
              >
                <Ionicons name="aperture-outline" size={34} color={tokens.sobrePrimario} />
              </View>
              <View className="items-center">
                <Text style={{ color: tokens.texto }} className="text-2xl font-bold text-texto">
                  Stocker
                </Text>
                <Text style={{ color: tokens.textoSuave }} className="text-sm text-texto-suave">
                  Sistema de control de stock
                </Text>
              </View>
            </View>

            <Tarjeta clase="gap-4">
              {recuperando ? (
                <RecuperarContrasena
                  emailInicial={email}
                  onVolver={() => setRecuperando(false)}
                />
              ) : (
              <>
              <Text style={{ color: tokens.texto }} className="text-lg font-bold text-texto">
                Iniciar sesión
              </Text>

              <Entrada
                etiqueta="Correo electrónico"
                icono="mail-outline"
                placeholder="admin@retenes.local"
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

              <Pressable
                accessibilityRole="button"
                onPress={() => setRecuperando(true)}
                className="items-end"
              >
                <Text
                  style={{ color: tokens.primario }}
                  className="text-sm font-semibold text-primario"
                >
                  ¿Olvidaste tu contraseña?
                </Text>
              </Pressable>

              <Boton
                titulo="Ingresar"
                icono="log-in-outline"
                anchoCompleto
                cargando={cargando}
                onPress={() => void enviar()}
              />

              {/* Divisor OAuth */}
              <View className="my-1 flex-row items-center gap-3">
                <View style={{ backgroundColor: tokens.borde }} className="h-[1px] flex-1 bg-borde" />
                <Text
                  style={{ color: tokens.textoSuave }}
                  className="text-xs font-semibold uppercase text-texto-suave"
                >
                  O ingresá con OAuth
                </Text>
                <View style={{ backgroundColor: tokens.borde }} className="h-[1px] flex-1 bg-borde" />
              </View>

              {/* Botones OAuth reales: Google, GitHub y Facebook */}
              <View className="gap-2.5">
                {PROVEEDORES_SOCIALES.map((prov) => {
                  const activo = oauthEnCurso === prov.id;
                  return (
                    <Pressable
                      key={prov.id}
                      accessibilityRole="button"
                      accessibilityLabel={`Continuar con ${prov.nombre}`}
                      disabled={cargando || Boolean(oauthEnCurso)}
                      onPress={() => void iniciarOAuthReal(prov)}
                      style={{
                        backgroundColor: tokens.superficieAlt,
                        borderColor: activo ? tokens.primario : tokens.borde
                      }}
                      className={cn(
                        'flex-row items-center justify-center gap-3 rounded-xl border px-4 py-3 active:opacity-80',
                        (cargando || (oauthEnCurso && !activo)) && 'opacity-50'
                      )}
                    >
                      {activo ? (
                        <ActivityIndicator size="small" color={tokens.primario} />
                      ) : (
                        <View
                          style={{ backgroundColor: prov.color }}
                          className="h-7 w-7 items-center justify-center rounded-lg"
                        >
                          <Ionicons name={prov.icono} size={16} color="#FFFFFF" />
                        </View>
                      )}
                      <Text
                        style={{ color: tokens.texto }}
                        className="text-sm font-bold text-texto"
                      >
                        {activo
                          ? `Esperando autorización de ${prov.nombre}…`
                          : `Continuar con ${prov.nombre}`}
                      </Text>
                    </Pressable>
                  );
                })}
                {oauthEnCurso && (
                  <Pressable
                    onPress={() => {
                      detenerPolling();
                      setOauthEnCurso(null);
                    }}
                    className="items-center pt-1"
                  >
                    <Text
                      style={{ color: tokens.peligro }}
                      className="text-xs font-semibold text-peligro"
                    >
                      Cancelar espera de autenticación
                    </Text>
                  </Pressable>
                )}
              </View>
              </>
              )}
            </Tarjeta>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

/**
 * @file Pantalla de inicio de sesión con email/contraseña, solicitud de creación
 *       de usuario (con aprobación del Administrador) y acceso OAuth 2.0 real
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

interface RespuestaRegistro {
  id: number;
  email: string;
  nombre: string;
  apellido: string | null;
  pendienteAprobacion: boolean;
  mensaje: string;
}

/** Formulario de acceso y creación de usuario. */
export function InicioSesion() {
  const { tokens, esOscuro, alternar } = useTema();
  const despachar = useDespacho();
  const { avisar, alertar } = usePopUps();
  const cargando = useSeleccionar((estado) => estado.sesion.cargando);

  const [modoVista, setModoVista] = useState<'login' | 'registro' | 'recuperar'>('login');

  // Campos de inicio de sesión
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorEmail, setErrorEmail] = useState<string | null>(null);
  const [errorPassword, setErrorPassword] = useState<string | null>(null);
  const [oauthEnCurso, setOauthEnCurso] = useState<ProveedorOAuth | null>(null);
  const intervaloRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Campos de "Crear Usuario" (solicitud sujeta a aprobación del Administrador)
  const [regNombre, setRegNombre] = useState('');
  const [regApellido, setRegApellido] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regTelefono, setRegTelefono] = useState('');
  const [regRol, setRegRol] = useState<'vendedor' | 'deposito'>('vendedor');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmar, setRegConfirmar] = useState('');
  const [registrando, setRegistrando] = useState(false);
  const [mensajePendiente, setMensajePendiente] = useState<string | null>(null);

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

  const validarLogin = (): boolean => {
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
    if (cargando || !validarLogin()) return;
    const resultado = await despachar(iniciarSesion({ email: email.trim(), password }));
    if (iniciarSesion.rejected.match(resultado)) {
      avisar(resultado.payload ?? 'No se pudo iniciar sesión.', 'peligro');
    }
  };

  const enviarSolicitudRegistro = async () => {
    const nombreLimpio = regNombre.trim();
    const apellidoLimpio = regApellido.trim();
    const correoLimpio = regEmail.trim().toLowerCase();
    const telefonoLimpio = regTelefono.trim();

    if (!nombreLimpio) {
      avisar('Ingresá tu nombre.', 'advertencia');
      return;
    }
    if (!apellidoLimpio) {
      avisar('Ingresá tu apellido.', 'advertencia');
      return;
    }
    if (!correoLimpio || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoLimpio)) {
      avisar('Ingresá un correo electrónico válido.', 'advertencia');
      return;
    }
    if (regPassword.length < 8) {
      avisar('La contraseña debe tener al menos 8 caracteres.', 'advertencia');
      return;
    }
    if (regPassword !== regConfirmar) {
      avisar('Las contraseñas ingresadas no coinciden.', 'advertencia');
      return;
    }

    setRegistrando(true);
    try {
      const resp = await peticion<RespuestaRegistro>('/auth/registro', {
        metodo: 'POST',
        autenticada: false,
        cuerpo: {
          nombre: nombreLimpio,
          apellido: apellidoLimpio,
          email: correoLimpio,
          telefono: telefonoLimpio || undefined,
          rol: regRol,
          password: regPassword
        }
      });

      setEmail(correoLimpio);
      setPassword('');
      setRegNombre('');
      setRegApellido('');
      setRegEmail('');
      setRegTelefono('');
      setRegPassword('');
      setRegConfirmar('');
      setMensajePendiente(
        resp.mensaje ||
          'Tu solicitud de creación de usuario fue enviada. Necesita permiso del Administrador para habilitar el acceso.'
      );
      setModoVista('login');

      await alertar({
        titulo: 'Solicitud de usuario enviada',
        mensaje:
          'Tu cuenta fue registrada correctamente y está pendiente de permiso del Administrador. Una vez que el Administrador acepte tu usuario en la sección "Usuarios y Roles", podrás iniciar sesión con tu correo y contraseña.',
        tipo: 'exito'
      });
    } catch (error) {
      avisar(
        error instanceof Error ? error.message : 'No se pudo registrar la solicitud de usuario.',
        'peligro'
      );
    } finally {
      setRegistrando(false);
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
          contentContainerClassName="flex-grow items-center justify-center p-6 pb-16"
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
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
              {/* Pestañas superiores: Iniciar sesión vs Crear Usuario */}
              {modoVista !== 'recuperar' && (
                <View
                  style={{ backgroundColor: tokens.superficieAlt, borderColor: tokens.borde }}
                  className="flex-row rounded-xl border p-1"
                >
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setModoVista('login')}
                    style={{
                      backgroundColor: modoVista === 'login' ? tokens.primario : 'transparent'
                    }}
                    className="flex-1 flex-row items-center justify-center gap-1.5 rounded-lg py-2"
                  >
                    <Ionicons
                      name="log-in-outline"
                      size={16}
                      color={
                        modoVista === 'login'
                          ? esOscuro
                            ? tokens.fondo
                            : '#FFFFFF'
                          : tokens.textoSuave
                      }
                    />
                    <Text
                      style={{
                        color:
                          modoVista === 'login'
                            ? esOscuro
                              ? tokens.fondo
                              : '#FFFFFF'
                            : tokens.textoSuave
                      }}
                      className="text-xs font-bold"
                    >
                      Iniciar sesión
                    </Text>
                  </Pressable>

                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setModoVista('registro')}
                    style={{
                      backgroundColor: modoVista === 'registro' ? tokens.primario : 'transparent'
                    }}
                    className="flex-1 flex-row items-center justify-center gap-1.5 rounded-lg py-2"
                  >
                    <Ionicons
                      name="person-add-outline"
                      size={16}
                      color={
                        modoVista === 'registro'
                          ? esOscuro
                            ? tokens.fondo
                            : '#FFFFFF'
                          : tokens.textoSuave
                      }
                    />
                    <Text
                      style={{
                        color:
                          modoVista === 'registro'
                            ? esOscuro
                              ? tokens.fondo
                              : '#FFFFFF'
                            : tokens.textoSuave
                      }}
                      className="text-xs font-bold"
                    >
                      Crear Usuario
                    </Text>
                  </Pressable>
                </View>
              )}

              {modoVista === 'recuperar' ? (
                <RecuperarContrasena
                  emailInicial={email}
                  onVolver={() => setModoVista('login')}
                />
              ) : modoVista === 'registro' ? (
                <View className="gap-3.5">
                  <View>
                    <Text style={{ color: tokens.texto }} className="text-lg font-bold text-texto">
                      Crear Usuario
                    </Text>
                    <Text
                      style={{ color: tokens.textoSuave }}
                      className="mt-0.5 text-xs text-texto-suave"
                    >
                      Completá los datos requeridos. Tu cuenta requerirá el permiso del Administrador para poder ingresar.
                    </Text>
                  </View>

                  <View className="flex-row gap-2.5">
                    <View className="min-w-0 flex-1">
                      <Entrada
                        etiqueta="Nombre *"
                        icono="person-outline"
                        placeholder="Tu nombre"
                        value={regNombre}
                        onChangeText={setRegNombre}
                      />
                    </View>
                    <View className="min-w-0 flex-1">
                      <Entrada
                        etiqueta="Apellido *"
                        icono="person-outline"
                        placeholder="Tu apellido"
                        value={regApellido}
                        onChangeText={setRegApellido}
                      />
                    </View>
                  </View>

                  <Entrada
                    etiqueta="Correo electrónico *"
                    icono="mail-outline"
                    placeholder="usuario@correo.com"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={regEmail}
                    onChangeText={setRegEmail}
                  />

                  <Entrada
                    etiqueta="Teléfono"
                    icono="call-outline"
                    placeholder="+54 11 ..."
                    keyboardType="phone-pad"
                    value={regTelefono}
                    onChangeText={setRegTelefono}
                  />

                  <View className="gap-1.5">
                    <Text
                      style={{ color: tokens.textoSuave }}
                      className="text-xs font-semibold text-texto-suave"
                    >
                      Rol solicitado *
                    </Text>
                    <View className="flex-row gap-2">
                      {(
                        [
                          { codigo: 'vendedor', etiqueta: 'Vendedor / Consulta' },
                          { codigo: 'deposito', etiqueta: 'Encargado de Depósito' }
                        ] as const
                      ).map((op) => {
                        const activo = regRol === op.codigo;
                        return (
                          <Pressable
                            key={op.codigo}
                            onPress={() => setRegRol(op.codigo)}
                            style={{
                              backgroundColor: activo ? tokens.primario : tokens.superficieAlt,
                              borderColor: activo ? tokens.primario : tokens.borde
                            }}
                            className="flex-1 items-center justify-center rounded-xl border px-3 py-2.5"
                          >
                            <Text
                              style={{
                                color: activo
                                  ? esOscuro
                                    ? tokens.fondo
                                    : '#FFFFFF'
                                  : tokens.texto
                              }}
                              className="text-center text-xs font-bold"
                            >
                              {op.etiqueta}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>

                  <Entrada
                    etiqueta="Contraseña * (mínimo 8 caracteres)"
                    icono="lock-closed-outline"
                    placeholder="Mínimo 8 caracteres"
                    secureTextEntry
                    autoCapitalize="none"
                    value={regPassword}
                    onChangeText={setRegPassword}
                  />

                  <Entrada
                    etiqueta="Confirmar contraseña *"
                    icono="checkmark-circle-outline"
                    placeholder="Repetí tu contraseña"
                    secureTextEntry
                    autoCapitalize="none"
                    value={regConfirmar}
                    onChangeText={setRegConfirmar}
                  />

                  <View
                    style={{
                      backgroundColor: `${tokens.primario}15`,
                      borderColor: `${tokens.primario}45`
                    }}
                    className="flex-row items-center gap-2.5 rounded-xl border p-3"
                  >
                    <Ionicons name="shield-checkmark-outline" size={20} color={tokens.primario} />
                    <Text
                      style={{ color: tokens.textoSuave }}
                      className="flex-1 text-xs leading-4 text-texto-suave"
                    >
                      Una vez enviada la solicitud, el <Text className="font-bold text-texto">Administrador</Text> deberá aceptar tu usuario para habilitar el acceso.
                    </Text>
                  </View>

                  <Boton
                    titulo="Crear Usuario (Solicitar aprobación)"
                    icono="person-add-outline"
                    anchoCompleto
                    cargando={registrando}
                    onPress={() => void enviarSolicitudRegistro()}
                  />

                  <Boton
                    titulo="Ya tengo cuenta — Iniciar sesión"
                    variante="secundario"
                    anchoCompleto
                    onPress={() => setModoVista('login')}
                  />
                </View>
              ) : (
                <>
                  <Text style={{ color: tokens.texto }} className="text-lg font-bold text-texto">
                    Iniciar sesión
                  </Text>

                  {mensajePendiente && (
                    <View
                      style={{
                        backgroundColor: `${tokens.advertencia}18`,
                        borderColor: `${tokens.advertencia}55`
                      }}
                      className="flex-row items-start gap-2.5 rounded-xl border p-3"
                    >
                      <Ionicons name="time-outline" size={20} color={tokens.advertencia} />
                      <Text
                        style={{ color: tokens.texto }}
                        className="flex-1 text-xs leading-4 text-texto"
                      >
                        {mensajePendiente}
                      </Text>
                    </View>
                  )}

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
                    onPress={() => setModoVista('recuperar')}
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

                  <Boton
                    titulo="Crear Usuario"
                    icono="person-add-outline"
                    variante="contorno"
                    anchoCompleto
                    onPress={() => setModoVista('registro')}
                  />

                  {/* Divisor OAuth */}
                  <View className="my-1 flex-row items-center gap-3">
                    <View
                      style={{ backgroundColor: tokens.borde }}
                      className="h-[1px] flex-1 bg-borde"
                    />
                    <Text
                      style={{ color: tokens.textoSuave }}
                      className="text-xs font-semibold uppercase text-texto-suave"
                    >
                      O ingresá con OAuth
                    </Text>
                    <View
                      style={{ backgroundColor: tokens.borde }}
                      className="h-[1px] flex-1 bg-borde"
                    />
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

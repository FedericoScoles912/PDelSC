/**
 * @file Sistema de diálogos y avisos propio.
 *
 * Reemplaza por completo a `alert()`, `confirm()`, `prompt()` y
 * `Alert.alert`: la aplicación no usa ninguna de esas APIs. Expone tres
 * operaciones asíncronas:
 *   - `alertar`   → diálogo informativo con un botón.
 *   - `confirmar` → diálogo de decisión que resuelve `true`/`false`.
 *   - `solicitar` → diálogo que pide un texto al usuario.
 *   - `avisar`    → aviso flotante (toast) que se cierra solo.
 * @module client/src/componentes/popups/PopUpsProvider
 */

import { Ionicons } from '@expo/vector-icons';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from 'react';
import { Animated, Modal, Pressable, Text, View } from 'react-native';

import { Boton } from '../ui/Boton';
import { Entrada } from '../ui/Entrada';
import { cn } from '../../utils/cn';
import { useTema } from '../../tema/TemaProvider';

/** Tipos de mensaje admitidos. */
export type TipoMensaje = 'info' | 'exito' | 'advertencia' | 'peligro';

/** Opciones del diálogo informativo. */
export interface OpcionesAlerta {
  /** Título del diálogo. */
  titulo?: string;
  /** Mensaje principal. */
  mensaje: string;
  /** Tipo de mensaje (define icono y color). */
  tipo?: TipoMensaje;
  /** Texto del botón de aceptar. */
  textoAceptar?: string;
}

/** Opciones del diálogo de confirmación. */
export interface OpcionesConfirmar extends OpcionesAlerta {
  /** Texto del botón de cancelar. */
  textoCancelar?: string;
  /** Marca la acción principal como destructiva. */
  peligroso?: boolean;
}

/** Opciones del diálogo de entrada de texto. */
export interface OpcionesSolicitar extends OpcionesConfirmar {
  /** Texto inicial del campo. */
  valorInicial?: string;
  /** Marcador del campo. */
  marcador?: string;
  /** Etiqueta del campo. */
  etiqueta?: string;
  /** El campo oculta el texto (contraseñas). */
  esPassword?: boolean;
  /** Valida el texto; devuelve un mensaje de error o `null`. */
  validar?: (valor: string) => string | null;
}

/** Estado interno de un diálogo abierto. */
interface DialogoActivo {
  id: number;
  tipo: 'alerta' | 'confirmar' | 'solicitar';
  opciones: OpcionesSolicitar;
  resolver: (valor: boolean | string | null) => void;
}

/** Aviso flotante. */
interface AvisoActivo {
  id: number;
  mensaje: string;
  tipo: TipoMensaje;
}

/** Valor del contexto de pop-ups. */
export interface ContextoPopUps {
  /** Muestra un diálogo informativo. */
  alertar: (opciones: OpcionesAlerta) => Promise<void>;
  /** Muestra un diálogo de confirmación. */
  confirmar: (opciones: OpcionesConfirmar) => Promise<boolean>;
  /** Pide un texto; resuelve `null` si se cancela. */
  solicitar: (opciones: OpcionesSolicitar) => Promise<string | null>;
  /** Muestra un aviso flotante. */
  avisar: (mensaje: string, tipo?: TipoMensaje) => void;
}

const Contexto = createContext<ContextoPopUps | null>(null);

const COLOR_TIPO: Record<TipoMensaje, string> = {
  info: '#3A6E8A',
  exito: '#4E7C4A',
  advertencia: '#C7791B',
  peligro: '#B3261E'
};

const ICONO_TIPO: Record<TipoMensaje, keyof typeof Ionicons.glyphMap> = {
  info: 'information-circle',
  exito: 'checkmark-circle',
  advertencia: 'warning',
  peligro: 'alert-circle'
};

const DURACION_AVISO = 3600;

/** Provee diálogos y avisos propios a la aplicación. */
export function PopUpsProvider({ children }: { children: ReactNode }) {
  const { tokens, esquema } = useTema();
  const [dialogo, setDialogo] = useState<DialogoActivo | null>(null);
  const [aviso, setAviso] = useState<AvisoActivo | null>(null);
  const [texto, setTexto] = useState('');
  const [errorTexto, setErrorTexto] = useState<string | null>(null);
  const contador = useRef(0);
  const opacidad = useRef(new Animated.Value(0)).current;
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  const alertar = useCallback(
    (opciones: OpcionesAlerta) =>
      new Promise<void>((resolver) => {
        contador.current += 1;
        setTexto('');
        setErrorTexto(null);
        setDialogo({
          id: contador.current,
          tipo: 'alerta',
          opciones,
          resolver: () => resolver()
        });
      }),
    []
  );

  const confirmar = useCallback(
    (opciones: OpcionesConfirmar) =>
      new Promise<boolean>((resolver) => {
        contador.current += 1;
        setTexto('');
        setErrorTexto(null);
        setDialogo({
          id: contador.current,
          tipo: 'confirmar',
          opciones,
          resolver: (valor) => resolver(valor === true)
        });
      }),
    []
  );

  const solicitar = useCallback(
    (opciones: OpcionesSolicitar) =>
      new Promise<string | null>((resolver) => {
        contador.current += 1;
        setTexto(opciones.valorInicial ?? '');
        setErrorTexto(null);
        setDialogo({
          id: contador.current,
          tipo: 'solicitar',
          opciones,
          resolver: (valor) => resolver(typeof valor === 'string' ? valor : null)
        });
      }),
    []
  );

  const avisar = useCallback(
    (mensaje: string, tipo: TipoMensaje = 'info') => {
      contador.current += 1;
      setAviso({ id: contador.current, mensaje, tipo });
    },
    []
  );

  // Entrada/salida del aviso flotante.
  useEffect(() => {
    if (!aviso) return;
    opacidad.setValue(0);
    Animated.timing(opacidad, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true
    }).start();
    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => {
      Animated.timing(opacidad, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      }).start(() => setAviso(null));
    }, DURACION_AVISO);
    return () => {
      if (temporizador.current) clearTimeout(temporizador.current);
    };
  }, [aviso, opacidad]);

  const valor = useMemo<ContextoPopUps>(
    () => ({ alertar, confirmar, solicitar, avisar }),
    [alertar, confirmar, solicitar, avisar]
  );

  const cerrar = useCallback(
    (resultado: boolean | string | null) => {
      dialogo?.resolver(resultado);
      setDialogo(null);
      setErrorTexto(null);
    },
    [dialogo]
  );

  const aceptarSolicitud = useCallback(() => {
    if (!dialogo) return;
    const validador = dialogo.opciones.validar;
    if (validador) {
      const mensajeError = validador(texto);
      if (mensajeError) {
        setErrorTexto(mensajeError);
        return;
      }
    }
    cerrar(texto);
  }, [dialogo, texto, cerrar]);

  const tipo = dialogo?.opciones.tipo ?? 'info';
  const colorDinamico = esquema === 'oscuro' ? tokens.primarioSuave : COLOR_TIPO[tipo];
  const colorAcento =
    tipo === 'info' ? tokens.info : tipo === 'exito' ? tokens.exito : tipo === 'advertencia' ? tokens.advertencia : tokens.peligro;

  return (
    <Contexto.Provider value={valor}>
      {children}

      {/* Diálogos */}
      <Modal
        visible={Boolean(dialogo)}
        transparent
        animationType="fade"
        onRequestClose={() => cerrar(dialogo?.tipo === 'confirmar' ? false : null)}
      >
        <View className="flex-1 items-center justify-center bg-black/50 p-4">
          <View className="w-full max-w-md rounded-2xl border border-borde bg-superficie p-5">
            <View className="mb-3 flex-row items-center gap-3">
              <View
                className="h-11 w-11 items-center justify-center rounded-full"
                style={{ backgroundColor: `${colorAcento}22` }}
              >
                <Ionicons
                  name={ICONO_TIPO[dialogo?.tipo === 'confirmar' ? 'advertencia' : tipo]}
                  size={24}
                  color={colorAcento}
                />
              </View>
              <Text className="flex-1 text-lg font-bold text-texto">
                {dialogo?.opciones.titulo ??
                  (dialogo?.tipo === 'confirmar'
                    ? 'Confirmar acción'
                    : dialogo?.tipo === 'solicitar'
                      ? 'Ingrese un valor'
                      : 'Aviso')}
              </Text>
            </View>

            <Text className="text-base leading-6 text-texto">{dialogo?.opciones.mensaje}</Text>

            {dialogo?.tipo === 'solicitar' && (
              <View className="mt-4">
                <Entrada
                  etiqueta={dialogo.opciones.etiqueta}
                  placeholder={dialogo.opciones.marcador}
                  value={texto}
                  onChangeText={(nuevo) => {
                    setTexto(nuevo);
                    if (errorTexto) setErrorTexto(null);
                  }}
                  error={errorTexto ?? undefined}
                  secureTextEntry={dialogo.opciones.esPassword}
                  autoFocus
                />
              </View>
            )}

            <View className="mt-5 flex-row justify-end gap-2">
              {dialogo?.tipo !== 'alerta' && (
                <Boton
                  titulo={dialogo?.opciones.textoCancelar ?? 'Cancelar'}
                  variante="secundario"
                  onPress={() => cerrar(dialogo?.tipo === 'solicitar' ? null : false)}
                />
              )}
              <Boton
                titulo={dialogo?.opciones.textoAceptar ?? 'Aceptar'}
                variante={
                  dialogo?.tipo === 'confirmar' && dialogo.opciones.peligroso ? 'peligro' : 'primario'
                }
                onPress={() =>
                  dialogo?.tipo === 'solicitar' ? aceptarSolicitud() : cerrar(dialogo?.tipo === 'confirmar' ? true : null)
                }
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Aviso flotante */}
      {aviso && (
        <Animated.View
          pointerEvents="none"
          style={{ opacity: opacidad }}
          className="absolute left-0 right-0 top-4 items-center px-4"
        >
          <Pressable
            onPress={() => setAviso(null)}
            className={cn(
              'max-w-xl flex-row items-center gap-2 rounded-xl border border-borde px-4 py-3'
            )}
            style={{ backgroundColor: tokens.superficie, borderLeftColor: colorDinamico, borderLeftWidth: 4 }}
          >
            <Ionicons name={ICONO_TIPO[aviso.tipo]} size={20} color={colorDinamico} />
            <Text className="flex-1 text-sm font-medium text-texto">{aviso.mensaje}</Text>
          </Pressable>
        </Animated.View>
      )}
    </Contexto.Provider>
  );
}

/** Accede al sistema de pop-ups. Lanza si se usa fuera del proveedor. */
export function usePopUps(): ContextoPopUps {
  const contexto = useContext(Contexto);
  if (!contexto) {
    throw new Error('usePopUps debe usarse dentro de <PopUpsProvider>.');
  }
  return contexto;
}

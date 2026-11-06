/**
 * @file Proveedor del tema claro/oscuro. Sincroniza NativeWind
 *       (`colorScheme`) con la preferencia persistida y expone los tokens de
 *       color para el código JavaScript (navegación, iconos, gráficos).
 * @module client/src/tema/TemaProvider
 */

import { useColorScheme, vars } from 'nativewind';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Appearance, Platform } from 'react-native';

import { CLAVES, guardar, obtener } from '../servicios/almacenamiento';
import { TOKENS, VARIABLES_CSS, type Esquema, type TokensColor } from './tokens';

/** Valor del contexto de tema. */
export interface ContextoTema {
  /** Esquema activo. */
  esquema: Esquema;
  /** `true` cuando el esquema es oscuro. */
  esOscuro: boolean;
  /** Tokens de color resueltos para el esquema activo. */
  tokens: TokensColor;
  /** Estilo de variables CSS nativas para contenedores y modales. */
  estiloVariables: Record<string, unknown>;
  /** Clase a aplicar en la raíz para activar las variables CSS oscuras. */
  claseRaiz: string;
  /** Alterna entre claro y oscuro. */
  alternar: () => void;
  /** Fija un esquema concreto. */
  fijar: (esquema: Esquema) => void;
}

const Contexto = createContext<ContextoTema | null>(null);

/** Sincroniza el esquema en el DOM web y en Appearance nativo. */
function sincronizarEntorno(nuevo: Esquema, setColorScheme: (scheme: 'light' | 'dark') => void) {
  const modo = nuevo === 'oscuro' ? 'dark' : 'light';
  try {
    setColorScheme(modo);
  } catch {
    /* ignorar */
  }
  try {
    if (Platform.OS !== 'web' && typeof Appearance.setColorScheme === 'function') {
      Appearance.setColorScheme(modo);
    }
  } catch {
    /* ignorar */
  }
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    const html = document.documentElement;
    html.classList.toggle('dark', nuevo === 'oscuro');
    document.body?.classList.toggle('dark', nuevo === 'oscuro');
    const mapa = VARIABLES_CSS[nuevo];
    for (const [clave, valor] of Object.entries(mapa)) {
      html.style.setProperty(clave, valor);
    }
    html.style.backgroundColor = TOKENS[nuevo].fondo;
    html.style.colorScheme = modo;
  }
}

/** Provee el tema a toda la aplicación. */
export function TemaProvider({ children }: { children: ReactNode }) {
  const { colorScheme, setColorScheme } = useColorScheme();
  const [esquema, setEsquema] = useState<Esquema>('claro');

  // Recupera la preferencia guardada; si no existe, sigue al sistema.
  useEffect(() => {
    let vigente = true;
    void (async () => {
      const guardado = await obtener(CLAVES.tema);
      if (!vigente) return;
      if (guardado === 'claro' || guardado === 'oscuro') {
        setEsquema(guardado);
        sincronizarEntorno(guardado, setColorScheme);
      } else {
        const inicial: Esquema = colorScheme === 'dark' ? 'oscuro' : 'claro';
        setEsquema(inicial);
        sincronizarEntorno(inicial, setColorScheme);
      }
    })();
    return () => {
      vigente = false;
    };
    // Sólo se ejecuta al montar: la preferencia inicial se resuelve una vez.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fijar = useCallback(
    (nuevo: Esquema) => {
      setEsquema(nuevo);
      sincronizarEntorno(nuevo, setColorScheme);
      void guardar(CLAVES.tema, nuevo);
    },
    [setColorScheme]
  );

  const alternar = useCallback(() => {
    fijar(esquema === 'oscuro' ? 'claro' : 'oscuro');
  }, [esquema, fijar]);

  const estiloVariables = useMemo(
    () => (vars(VARIABLES_CSS[esquema]) as unknown as Record<string, unknown>) ?? {},
    [esquema]
  );

  const valor = useMemo<ContextoTema>(
    () => ({
      esquema,
      esOscuro: esquema === 'oscuro',
      tokens: TOKENS[esquema],
      estiloVariables,
      claseRaiz: esquema === 'oscuro' ? 'dark flex-1' : 'flex-1',
      alternar,
      fijar
    }),
    [esquema, estiloVariables, alternar, fijar]
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

/** Accede al contexto de tema. Lanza si se usa fuera del proveedor. */
export function useTema(): ContextoTema {
  const contexto = useContext(Contexto);
  if (!contexto) {
    throw new Error('useTema debe usarse dentro de <TemaProvider>.');
  }
  return contexto;
}

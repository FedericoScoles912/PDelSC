/**
 * @file Proveedor del tema claro/oscuro. Sincroniza NativeWind
 *       (`colorScheme`) con la preferencia persistida y expone los tokens de
 *       color para el código JavaScript (navegación, iconos, gráficos).
 * @module client/src/tema/TemaProvider
 */

import { useColorScheme } from 'nativewind';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { CLAVES, guardar, obtener } from '../servicios/almacenamiento';
import { TOKENS, type Esquema, type TokensColor } from './tokens';

/** Valor del contexto de tema. */
export interface ContextoTema {
  /** Esquema activo. */
  esquema: Esquema;
  /** `true` cuando el esquema es oscuro. */
  esOscuro: boolean;
  /** Tokens de color resueltos para el esquema activo. */
  tokens: TokensColor;
  /** Clase a aplicar en la raíz para activar las variables CSS oscuras. */
  claseRaiz: string;
  /** Alterna entre claro y oscuro. */
  alternar: () => void;
  /** Fija un esquema concreto. */
  fijar: (esquema: Esquema) => void;
}

const Contexto = createContext<ContextoTema | null>(null);

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
        setColorScheme(guardado === 'oscuro' ? 'dark' : 'light');
      } else {
        const inicial: Esquema = colorScheme === 'dark' ? 'oscuro' : 'claro';
        setEsquema(inicial);
        setColorScheme(inicial === 'oscuro' ? 'dark' : 'light');
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
      setColorScheme(nuevo === 'oscuro' ? 'dark' : 'light');
      void guardar(CLAVES.tema, nuevo);
    },
    [setColorScheme]
  );

  const alternar = useCallback(() => {
    fijar(esquema === 'oscuro' ? 'claro' : 'oscuro');
  }, [esquema, fijar]);

  const valor = useMemo<ContextoTema>(
    () => ({
      esquema,
      esOscuro: esquema === 'oscuro',
      tokens: TOKENS[esquema],
      claseRaiz: esquema === 'oscuro' ? 'dark flex-1' : 'flex-1',
      alternar,
      fijar
    }),
    [esquema, alternar, fijar]
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

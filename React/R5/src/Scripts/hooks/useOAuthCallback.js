import { useCallback, useEffect, useRef, useState } from 'react';

import { oauthService } from '../services/oauthService.js';
import { getProviderName } from '../config/oauthProviders.js';
import { useAuth } from './useAuth.js';

/** Parámetros de la URL que se limpian tras procesar el retorno del proveedor. */
const OAUTH_QUERY_KEYS = ['code', 'error', 'error_description', 'state', 'linked', 'provider'];

/** Traduce los códigos de error del backend a mensajes para el usuario. */
function describeError(errorCode, providerId) {
  switch (errorCode) {
    case 'access_denied':
      return 'Cancelaste la autorización. Podés intentarlo de nuevo cuando quieras.';
    case 'invalid_state':
      return 'La solicitud expiró o no es válida. Volvé a intentar el inicio de sesión.';
    case 'provider_not_configured':
      return `La cuenta de ${getProviderName(providerId)} todavía no está habilitada: faltan sus credenciales (CLIENT_ID y CLIENT_SECRET) en el archivo .env del servidor.`;
    case 'auth_failed':
    default:
      return 'No pudimos completar el inicio de sesión social. Volvé a intentarlo.';
  }
}

/**
 * useOAuthCallback
 * ---------------------------------------------------------------------
 * Procesa el retorno del proveedor OAuth en el frontend. Lo usan AMBOS
 * sistemas (Sistema A en la ruta /auth/callback y Sistema B al montar).
 *
 * Flujo:
 *  1. Lee `code` / `error` de la URL y limpia esos parámetros con
 *     history.replaceState (el código nunca queda visible ni en el historial).
 *  2. Canjea el código contra POST /api/auth/exchange.
 *  3. Si el registro necesita email, deja el estado en 'needs_email' y expone
 *     completeEmail() para finalizarlo (el código no se consume hasta entonces).
 *
 * Devuelve: { status, error, pendingProfile, result, completeEmail, retry }
 *   status: 'idle' | 'processing' | 'needs_email' | 'error' | 'success'
 */
export function useOAuthCallback({ autoRun = true } = {}) {
  const { applyOAuthResult } = useAuth();

  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [pendingProfile, setPendingProfile] = useState(null);
  const [result, setResult] = useState(null);

  const codeRef = useRef(null); // el código se guarda antes de limpiar la URL
  const ranRef = useRef(false); // evita la doble ejecución de React StrictMode

  /** Quita los parámetros OAuth de la barra de direcciones sin recargar. */
  const cleanUrl = useCallback(() => {
    if (typeof window === 'undefined') return;

    const url = new URL(window.location.href);
    OAUTH_QUERY_KEYS.forEach((key) => url.searchParams.delete(key));
    window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`);
  }, []);

  /** Ejecuta el canje del código temporal. */
  const run = useCallback(async () => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const errorCode = params.get('error');

    if (!code && !errorCode) {
      setStatus('idle');
      return;
    }

    // El código se conserva en memoria: la URL se limpia inmediatamente.
    codeRef.current = code;
    cleanUrl();

    if (errorCode) {
      setError(describeError(errorCode, params.get('provider')));
      setStatus('error');
      return;
    }

    setStatus('processing');
    try {
      const data = await oauthService.exchange(code);
      applyOAuthResult(data);
      setResult(data);
      setStatus('success');
    } catch (exchangeError) {
      if (exchangeError.data?.requiresEmail) {
        setPendingProfile(exchangeError.data.profile ?? null);
        setStatus('needs_email');
        return;
      }
      setError(exchangeError.message);
      setStatus('error');
    }
  }, [applyOAuthResult, cleanUrl]);

  /* Procesa el retorno una sola vez, al montar (salvo que se desactive). */
  useEffect(() => {
    if (!autoRun || ranRef.current) return;
    ranRef.current = true;
    void run();
  }, [autoRun, run]);

  /** Completa el registro cuando el proveedor no devolvió email. */
  const completeEmail = useCallback(
    async (email) => {
      setStatus('processing');
      setError(null);
      try {
        const data = await oauthService.exchange(codeRef.current, email);
        applyOAuthResult(data);
        setResult(data);
        setStatus('success');
        return data;
      } catch (submitError) {
        setError(submitError.message);
        setStatus('error');
        return null;
      }
    },
    [applyOAuthResult]
  );

  return { status, error, pendingProfile, result, completeEmail, retry: run };
}

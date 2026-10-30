import { createContext, useCallback, useMemo, useState } from 'react';

import NoticeHost from '../../Components/NoticeHost.jsx';

export const NoticeContext = createContext(null);

/**
 * Reemplazo propio de alert() / confirm() / prompt() nativos.
 *
 * Expone:
 *  - notify(options):     muestra un aviso con un único botón.
 *  - confirm(options):    muestra una confirmación y devuelve una Promise<boolean>.
 *
 * `options` acepta string (mensaje) u objeto:
 *   { type: 'info'|'success'|'warning'|'error', title, message, confirmText,
 *     cancelText, destructive }
 */
export function NoticeProvider({ children }) {
  const [notice, setNotice] = useState(null);

  /** Cierra el aviso activo y resuelve su Promise (si la tiene). */
  const close = useCallback((result) => {
    setNotice((current) => {
      current?.resolve?.(result);
      return null;
    });
  }, []);

  const normalize = (options) => (typeof options === 'string' ? { message: options } : options ?? {});

  const notify = useCallback((options) => {
    const config = normalize(options);
    setNotice({
      mode: 'alert',
      type: config.type ?? 'info',
      title: config.title,
      message: config.message,
      confirmText: config.confirmText ?? 'Entendido',
      resolve: null,
    });
  }, []);

  const confirm = useCallback(
    (options) =>
      new Promise((resolve) => {
        const config = normalize(options);
        setNotice({
          mode: 'confirm',
          type: config.type ?? 'warning',
          title: config.title,
          message: config.message,
          confirmText: config.confirmText ?? 'Confirmar',
          cancelText: config.cancelText ?? 'Cancelar',
          destructive: Boolean(config.destructive),
          resolve,
        });
      }),
    []
  );

  const value = useMemo(() => ({ notify, confirm, close }), [notify, confirm, close]);

  return (
    <NoticeContext.Provider value={value}>
      {children}
      <NoticeHost notice={notice} onClose={close} />
    </NoticeContext.Provider>
  );
}

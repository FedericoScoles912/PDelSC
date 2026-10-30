import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FiX } from 'react-icons/fi';

import { cn } from '../Scripts/utils/helpers.js';

const SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

/**
 * Modal propio (portal a <body>). Reemplaza alert()/confirm() y se reutiliza
 * en ambos sistemas para avisos, confirmaciones y errores OAuth.
 *
 * Accesibilidad: role="dialog", aria-modal, cierre con Escape, bloqueo del
 * scroll del body y foco inicial en el panel.
 */
export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  closeOnBackdrop = true,
  showCloseButton = true,
}) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };

    document.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Fondo oscurecido; clic cierra el modal (configurable). */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={closeOnBackdrop ? () => onClose?.() : undefined}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          'relative w-full rounded-2xl border border-line bg-surface shadow-modal',
          'outline-none animate-pop-in',
          SIZES[size] ?? SIZES.md
        )}
      >
        {(title || showCloseButton) && (
          <header className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
            <div>
              {title && (
                <h2 id={titleId} className="text-lg font-semibold text-ink">
                  {title}
                </h2>
              )}
              {description && (
                <p id={descriptionId} className="mt-0.5 text-sm text-muted">
                  {description}
                </p>
              )}
            </div>

            {showCloseButton && (
              <button
                type="button"
                onClick={() => onClose?.()}
                aria-label="Cerrar"
                className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-alt hover:text-ink"
              >
                <FiX aria-hidden="true" className="text-lg" />
              </button>
            )}
          </header>
        )}

        <div className="px-6 py-5">{children}</div>

        {footer && (
          <footer className="flex flex-wrap items-center justify-end gap-3 border-t border-line px-6 py-4">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body
  );
}

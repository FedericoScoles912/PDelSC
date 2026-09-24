import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Button from '../atoms/Button.jsx';
import Icon from '../atoms/Icon.jsx';
import { classNames } from '../../Scripts/utils/helpers.js';

/**
 * Molécula: Modal — Ventana modal accesible (portal, focus trap mínimo, ESC para cerrar).
 */
export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  dismissOnOverlay = true,
  dismissOnEsc = true,
  size = 'md',
}) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!open || !dismissOnEsc) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, dismissOnEsc, onClose]);

  useEffect(() => {
    if (!open) return undefined;
    const scrollY = window.scrollY;
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = '';
      window.scrollTo({ top: scrollY });
    };
  }, [open]);

  if (!open || typeof document === 'undefined') return null;

  const sizeCls = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }[size] || 'max-w-md';

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      onClick={(e) => dismissOnOverlay && e.target === overlayRef.current && onClose?.()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
        aria-hidden
      />
      <div
        className={classNames(
          'relative card w-full p-6 shadow-lg animate-in zoom-in-95 duration-200',
          sizeCls
        )}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            {title && <h3 id="modal-title" className="text-xl font-semibold text-[color:var(--text-primary)] mb-1">{title}</h3>}
            {subtitle && <p className="text-sm text-[color:var(--text-secondary)] mb-0">{subtitle}</p>}
          </div>
          <Button variant="ghost" size="sm" aria-label="Cerrar" onClick={onClose}>
            <Icon name="close" />
          </Button>
        </div>
        <div className="mb-6">{children}</div>
        {footer && <div className="flex justify-end gap-2 flex-wrap">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}

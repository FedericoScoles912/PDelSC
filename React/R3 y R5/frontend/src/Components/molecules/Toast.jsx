import { useEffect, useRef } from 'react';
import { classNames } from '../../Scripts/utils/helpers.js';
import Icon from '../atoms/Icon.jsx';
import Button from '../atoms/Button.jsx';

/**
 * Molécula: Toast — un toast individual (usado por NotificationContainer).
 */
export default function Toast({ toast, onClose }) {
  const { id, type = 'info', message, title, duration = 4500 } = toast || {};
  const timerRef = useRef(null);

  useEffect(() => {
    if (!duration || duration <= 0) return undefined;
    timerRef.current = setTimeout(() => onClose?.(id), duration);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [duration, id, onClose]);

  const palette = {
    info:    { bg: 'var(--accent-primary)',  icon: 'info' },
    success: { bg: 'var(--accent-success)',  icon: 'check' },
    warning: { bg: 'var(--accent-warning)',  icon: 'alert' },
    error:   { bg: 'var(--accent-error)',    icon: 'alert' },
  }[type] || { bg: 'var(--accent-primary)', icon: 'info' };

  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      className={classNames(
        'relative overflow-hidden card p-4 flex items-start gap-3 min-w-[280px] max-w-sm shadow-warm animate-in slide-in-from-right duration-300'
      )}
    >
      <div
        className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white"
        style={{ background: palette.bg }}
      >
        <Icon name={palette.icon} size={16} strokeWidth={2.5} />
      </div>
      <div className="flex-1 min-w-0">
        {title && <div className="font-semibold text-[color:var(--text-primary)] text-sm mb-0.5">{title}</div>}
        <div className="text-sm text-[color:var(--text-secondary)] break-words">{message}</div>
      </div>
      <Button variant="ghost" size="sm" aria-label="Cerrar notificación" onClick={() => onClose?.(id)}>
        <Icon name="close" size={14} />
      </Button>
      <div
        className="absolute bottom-0 left-0 h-1 opacity-60"
        style={{
          background: palette.bg,
          width: '100%',
          animation: `toast-shrink ${duration}ms linear forwards`,
        }}
      />
      <style>{`@keyframes toast-shrink { from { transform: scaleX(1); } to { transform: scaleX(0); transform-origin: left; } }`}</style>
    </div>
  );
}

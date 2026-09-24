// ============================================================
// Components/NotificationModal.jsx  (Órgano / Modal Global)
// Renderiza la pila de toasts fija en la esquina superior
// derecha. Cada toast tiene ícono, color por tipo (success / error)
// y animación de entrada/salida con Framer Motion.
// Se cierra automáticamente tras 4.5s o manualmente con clic.
// ============================================================
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from './Icon.jsx';

const typeStyles = {
  success: {
    bg: 'bg-olive/95 dark:bg-olive/90',
    border: 'border-olive',
    text: 'text-cream',
    icon: 'check',
  },
  error: {
    bg: 'bg-softBrown/95 dark:bg-softBrown/90',
    border: 'border-terracotta',
    text: 'text-cream',
    icon: 'error',
  },
};

const slideIn = {
  initial: { opacity: 0, x: 120, scale: 0.95 },
  animate: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: 120, scale: 0.95 },
  transition: { duration: 0.35, ease: 'easeOut' },
};

export function NotificationModal({ toasts = [], removeToast }) {
  return (
    <div
      className="fixed top-4 right-4 z-[60] flex flex-col gap-3 w-full max-w-sm pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const style = typeStyles[toast.type] || typeStyles.error;

          return (
            <motion.div
              key={toast.id}
              layout
              {...slideIn}
              role="alert"
              onClick={() => removeToast(toast.id)}
              className={`pointer-events-auto cursor-pointer rounded-xl px-4 py-3.5 shadow-lg shadow-softBrown/20
                dark:shadow-burntOrange/30 border-l-4 ${style.bg} ${style.border} ${style.text}
                backdrop-blur-sm hover:brightness-105 transition-all`}
            >
              <div className="flex items-start gap-3">
                <span
                  className="flex-shrink-0 w-7 h-7 rounded-full
                    bg-white/20 flex items-center justify-center"
                  aria-hidden="true"
                >
                  <Icon name={style.icon} size={18} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold leading-relaxed break-words">
                    {toast.message}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeToast(toast.id);
                  }}
                  className="flex-shrink-0 w-6 h-6 rounded-md
                    bg-white/10 hover:bg-white/25
                    flex items-center justify-center transition-colors"
                  aria-label="Cerrar notificación"
                >
                  <Icon name="x" size={14} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export default NotificationModal;

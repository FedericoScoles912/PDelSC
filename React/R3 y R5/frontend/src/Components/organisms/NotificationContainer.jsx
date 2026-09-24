import useNotification from '../../Scripts/hooks/useNotification.js';
import Toast from '../molecules/Toast.jsx';

/**
 * Organismo: NotificationContainer — contenedor que renderiza los toasts
 * del NotificationContext en una esquina fija.
 */
export default function NotificationContainer() {
  const { toasts, remove } = useNotification();
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed z-[60] top-4 right-4 flex flex-col gap-3 pointer-events-none"
    >
      <div className="pointer-events-auto flex flex-col gap-3">
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onClose={remove} />
        ))}
      </div>
    </div>
  );
}

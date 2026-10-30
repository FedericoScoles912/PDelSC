import { FiAlertCircle, FiAlertTriangle, FiCheckCircle, FiInfo } from 'react-icons/fi';

import { cn } from '../Scripts/utils/helpers.js';
import Modal from './Modal.jsx';
import Button from './Button.jsx';

const TYPES = {
  info: { Icon: FiInfo, tone: 'text-primary bg-primary/10', title: 'Información' },
  success: { Icon: FiCheckCircle, tone: 'text-olive bg-olive/10', title: '¡Listo!' },
  warning: { Icon: FiAlertTriangle, tone: 'text-accent bg-accent/15', title: 'Atención' },
  error: { Icon: FiAlertCircle, tone: 'text-danger bg-danger/10', title: 'Ocurrió un problema' },
};

/**
 * Host visual del sistema de avisos. Lo monta <NoticeProvider> una sola vez
 * y renderiza el aviso activo con el componente Modal propio.
 *
 * `notice.mode`:
 *  - 'alert'   -> un botón para aceptar.
 *  - 'confirm' -> botones Cancelar / Confirmar (Promise<boolean>).
 */
export default function NoticeHost({ notice, onClose }) {
  if (!notice) return null;

  const config = TYPES[notice.type] ?? TYPES.info;
  const { Icon } = config;
  const isConfirm = notice.mode === 'confirm';

  const dismiss = () => onClose?.(isConfirm ? false : undefined);

  return (
    <Modal
      open
      onClose={dismiss}
      title={notice.title || config.title}
      showCloseButton={false}
      size="sm"
      footer={
        isConfirm ? (
          <>
            <Button variant="outline" size="sm" onClick={() => onClose?.(false)}>
              {notice.cancelText}
            </Button>
            <Button
              variant={notice.destructive ? 'danger' : 'primary'}
              size="sm"
              onClick={() => onClose?.(true)}
            >
              {notice.confirmText}
            </Button>
          </>
        ) : (
          <Button variant="primary" size="sm" onClick={() => onClose?.(true)}>
            {notice.confirmText}
          </Button>
        )
      }
    >
      <div className="flex items-start gap-3.5">
        <span
          className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', config.tone)}
          aria-hidden="true"
        >
          <Icon className="text-xl" />
        </span>
        <p className="pt-1.5 text-sm leading-relaxed text-ink">{notice.message}</p>
      </div>
    </Modal>
  );
}

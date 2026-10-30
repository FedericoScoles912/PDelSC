import { FiCheck, FiLink, FiTrash2 } from 'react-icons/fi';

import { cn } from '../Scripts/utils/helpers.js';
import { getProvider, getProviderName, getProviderTone } from '../Scripts/config/oauthProviders.js';
import Button from './Button.jsx';
import Spinner from './Spinner.jsx';

/**
 * Fila de un proveedor en la sección "Cuentas vinculadas" del perfil.
 * Muestra el estado y permite vincular/desvincular con una sola acción.
 */
export default function ProviderBadge({
  provider,
  linked = false,
  busy = false,
  onLink,
  onUnlink,
  disabled = false,
  disabledHint,
}) {
  const meta = getProvider(provider);
  const name = getProviderName(provider);
  const tone = getProviderTone(provider);
  const Icon = meta?.Icon;

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 rounded-xl border border-line bg-surface px-4 py-3'
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-alt',
            tone.icon
          )}
          aria-hidden="true"
        >
          {Icon ? <Icon className="text-lg" /> : <span className="text-sm font-semibold">{name[0]}</span>}
        </span>

        <div className="min-w-0">
          <p className="truncate font-medium text-ink">{name}</p>
          <p
            className={cn(
              'flex items-center gap-1 text-xs',
              linked ? 'text-olive' : 'text-muted'
            )}
          >
            {linked ? (
              <>
                <FiCheck aria-hidden="true" /> Vinculada
              </>
            ) : (
              'No vinculada'
            )}
          </p>
        </div>
      </div>

      {busy ? (
        <Spinner size="sm" />
      ) : linked ? (
        <Button
          variant="outline"
          size="sm"
          leftIcon={<FiTrash2 />}
          onClick={() => onUnlink?.(provider)}
          disabled={disabled}
          title={disabled ? disabledHint : `Desvincular ${name}`}
        >
          Desvincular
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<FiLink />}
          onClick={() => onLink?.(provider)}
          disabled={disabled}
        >
          Vincular
        </Button>
      )}
    </div>
  );
}

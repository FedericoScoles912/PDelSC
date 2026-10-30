import { FiGrid, FiLogOut, FiRepeat, FiUser } from 'react-icons/fi';

import Button from '../../Components/Button.jsx';
import ThemeToggle from '../../Components/ThemeToggle.jsx';
import { useAuth } from '../../Scripts/hooks/useAuth.js';
import { useNotice } from '../../Scripts/hooks/useNotice.js';
import { SYSTEM_LABELS, SYSTEMS } from '../../Scripts/utils/constants.js';
import { cn, getInitials, goTo } from '../../Scripts/utils/helpers.js';
import { VIEWS } from '../navigation.js';

/** Navegación del Sistema B: botones que cambian la vista, nunca rutas. */
const NAV_ITEMS = [
  { view: VIEWS.DASHBOARD, label: 'Panel', Icon: FiGrid },
  { view: VIEWS.PROFILE, label: 'Perfil', Icon: FiUser },
];

/**
 * Cabecera del area autenticada del Sistema B. No hay <NavLink>: la sección
 * activa se marca comparando la vista actual y se cambia con onNavigate().
 */
export default function SystemHeader({ currentView, onNavigate }) {
  const { user, logout } = useAuth();
  const { notify } = useNotice();

  const handleLogout = async () => {
    await logout();
    notify({ type: 'info', message: 'Cerraste sesión. ¡Hasta la próxima!' });
    onNavigate(VIEWS.LOGIN);
  };

  return (
    <header className="border-b border-line bg-surface">
      <div className="container-fluid mx-auto flex max-w-[1200px] flex-wrap items-center gap-4 px-6 py-3">
        <div className="flex flex-col leading-tight">
          <span className="text-xs font-semibold uppercase tracking-wide text-primary">
            user-auth-system
          </span>
          <span className="text-xs text-muted">{SYSTEM_LABELS[SYSTEMS.STATE]}</span>
        </div>

        <nav aria-label="Secciones" className="order-3 flex w-full gap-1 sm:order-none sm:w-auto">
          {NAV_ITEMS.map(({ view, label, Icon }) => (
            <button
              key={view}
              type="button"
              onClick={() => onNavigate(view)}
              aria-current={currentView === view ? 'page' : undefined}
              className={cn(
                'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                currentView === view ? 'bg-surface-alt text-ink' : 'text-muted hover:text-ink'
              )}
            >
              <Icon aria-hidden="true" className="text-base" />
              {label}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden items-center gap-2.5 md:flex">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                {getInitials(user?.name)}
              </span>
            )}
            <span className="max-w-[14rem] truncate text-sm font-medium text-ink">{user?.name}</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            leftIcon={<FiRepeat />}
            onClick={() => goTo('/')}
            title="Ver la misma app construida con React Router (Sistema A)"
          >
            <span className="hidden lg:inline">Sistema A</span>
          </Button>

          <ThemeToggle />

          <Button
            variant="outline"
            size="sm"
            leftIcon={<FiLogOut />}
            onClick={handleLogout}
            title="Cerrar sesión"
          >
            <span className="hidden sm:inline">Salir</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

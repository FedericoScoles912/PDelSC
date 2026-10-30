import { FiGrid, FiLogOut, FiRepeat, FiUser } from 'react-icons/fi';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';

import Button from '../../Components/Button.jsx';
import ThemeToggle from '../../Components/ThemeToggle.jsx';
import { useAuth } from '../../Scripts/hooks/useAuth.js';
import { useNotice } from '../../Scripts/hooks/useNotice.js';
import { SYSTEM_LABELS, SYSTEMS } from '../../Scripts/utils/constants.js';
import { cn, getInitials, goTo } from '../../Scripts/utils/helpers.js';

/** Navegación principal del área protegida. */
const NAV_ITEMS = [
  { to: '/dashboard', label: 'Panel', Icon: FiGrid },
  { to: '/profile', label: 'Perfil', Icon: FiUser },
];

/**
 * Layout del área autenticada: cabecera con navegación, accesos a perfil y
 * cierre de sesión, y el contenido de la ruta activa en el <Outlet />.
 */
export default function AppLayout() {
  const { user, logout } = useAuth();
  const { notify } = useNotice();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    notify({ type: 'info', message: 'Cerraste sesión. ¡Hasta la próxima!' });
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-line bg-surface">
        <div className="container-fluid mx-auto flex max-w-[1200px] flex-wrap items-center gap-4 px-6 py-3">
          <Link to="/dashboard" className="flex flex-col leading-tight">
            <span className="text-xs font-semibold uppercase tracking-wide text-primary">
              user-auth-system
            </span>
            <span className="text-xs text-muted">{SYSTEM_LABELS[SYSTEMS.ROUTER]}</span>
          </Link>

          <nav aria-label="Secciones" className="order-3 flex w-full gap-1 sm:order-none sm:w-auto">
            {NAV_ITEMS.map(({ to, label, Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                    isActive ? 'bg-surface-alt text-ink' : 'text-muted hover:text-ink'
                  )
                }
              >
                <Icon aria-hidden="true" className="text-base" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden items-center gap-2.5 md:flex">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt=""
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                  {getInitials(user?.name)}
                </span>
              )}
              <span className="max-w-[14rem] truncate text-sm font-medium text-ink">
                {user?.name}
              </span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              leftIcon={<FiRepeat />}
              onClick={() => goTo('/?system=state')}
              title="Ver la misma app construida con useState (Sistema B)"
            >
              <span className="hidden lg:inline">Sistema B</span>
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

      <main className="container-fluid mx-auto max-w-[1200px] px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}

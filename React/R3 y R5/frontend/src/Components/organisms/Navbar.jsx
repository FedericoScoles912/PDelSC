import Button from '../atoms/Button.jsx';
import ToggleTheme from '../atoms/ToggleTheme.jsx';
import Icon from '../atoms/Icon.jsx';
import useAuth from '../../Scripts/hooks/useAuth.js';
import { getInitials } from '../../Scripts/utils/helpers.js';

/**
 * Organismo: Navbar — compatible con ambos sistemas.
 * Recibe las props: `navigate(path)` y `currentScreen` (sistema B) o el `pathname` (sistema A).
 */
export default function Navbar({ navigate, current = 'dashboard', links }) {
  const { user, authenticated, logout } = useAuth();

  const nav = links || [
    { key: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { key: 'profile',   label: 'Perfil',    path: '/profile',   icon: 'user' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--border-subtle)] bg-[color:var(--bg-primary)]/90 backdrop-blur">
      <div className="max-w-content px-6 py-3 flex items-center gap-4">
        <button
          type="button"
          className="flex items-center gap-2 font-semibold text-[color:var(--text-primary)] hover:no-underline"
          onClick={() => navigate?.(authenticated ? '/dashboard' : '/login')}
        >
          <span className="inline-block w-8 h-8 rounded-lg flex items-center justify-center text-white"
                style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}>
            <span className="text-xs font-bold tracking-tight">A2</span>
          </span>
          <span className="hidden sm:inline">AuthDual</span>
        </button>

        <nav className="ml-2 hidden md:flex items-center gap-1 flex-1">
          {authenticated && nav.map((l) => {
            const active = current === l.key || current === l.path;
            return (
              <button
                key={l.key}
                onClick={() => navigate?.(l.path)}
                className={[
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors inline-flex items-center gap-2',
                  active
                    ? 'bg-[color:var(--bg-tertiary)] text-[color:var(--text-primary)]'
                    : 'text-[color:var(--text-secondary)] hover:bg-[color:var(--bg-secondary)] hover:text-[color:var(--text-primary)]',
                ].join(' ')}
              >
                <Icon name={l.icon} size={16} />
                {l.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 ml-auto">
          <ToggleTheme />

          {authenticated ? (
            <>
              <button
                type="button"
                onClick={() => navigate?.('/profile')}
                className="hidden sm:inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-[color:var(--border-subtle)] hover:bg-[color:var(--surface-hover)] transition-colors"
                title={user?.email}
              >
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <span
                    className="w-6 h-6 rounded-full text-[11px] font-semibold flex items-center justify-center text-white"
                    style={{ background: 'var(--accent-primary)' }}
                  >
                    {getInitials(user?.displayName)}
                  </span>
                )}
                <span className="text-sm font-medium text-[color:var(--text-primary)]">{user?.displayName}</span>
              </button>
              <Button variant="ghost" size="sm" onClick={logout} title="Cerrar sesión">
                <Icon name="logout" size={16} />
                <span className="hidden sm:inline ml-1">Salir</span>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate?.('/login')}>Ingresar</Button>
              <Button size="sm" onClick={() => navigate?.('/register')}>Crear cuenta</Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

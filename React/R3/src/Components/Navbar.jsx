import React from 'react';
import { useAuth } from '../Scripts/hooks/useAuth.js';
import ThemeToggle from './ThemeToggle.jsx';
import Button from './Button.jsx';

/**
 * Navbar responsiva con utilidades Bootstrap y estilos Tailwind
 * Soporta navegación en Sistema A (enlaces) y Sistema B (eventos de estado)
 */
export default function Navbar({
  systemName = 'Sistema A · Router',
  activeSystem = 'router',
  onSwitchSystem,
  onNavigate,
  activeRoute = '',
}) {
  const { user, isAuthenticated, logout } = useAuth();

  const handleNav = (target) => {
    if (onNavigate) {
      onNavigate(target);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-autumn-darkbg-card/90 backdrop-blur-md border-b border-autumn-beige-200 dark:border-autumn-darkbg-border transition-colors">
      <div className="container py-3">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
          {/* Logo y Badge de Sistema */}
          <div className="d-flex align-items-center gap-3">
            <button
              onClick={() => handleNav(isAuthenticated ? '/dashboard' : '/login')}
              className="d-flex align-items-center gap-2 text-decoration-none border-0 bg-transparent p-0 cursor-pointer text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-autumn-terracotta flex items-center justify-center text-white font-black text-lg shadow-sm">
                U
              </div>
              <div>
                <span className="font-bold text-base sm:text-lg text-autumn-warmbrown dark:text-autumn-darktext-primary block leading-tight">
                  user-auth-system
                </span>
                <span className="text-[11px] font-semibold tracking-wider uppercase text-autumn-terracotta dark:text-autumn-terracotta-light">
                  {systemName}
                </span>
              </div>
            </button>

            {/* Botón de alternancia de Sistema */}
            {onSwitchSystem && (
              <button
                type="button"
                onClick={onSwitchSystem}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-autumn-beige-100 hover:bg-autumn-beige-200 dark:bg-autumn-darkbg dark:hover:bg-autumn-darkbg-hover text-autumn-warmbrown-light dark:text-autumn-darktext-secondary border border-autumn-beige-300 dark:border-autumn-darkbg-border transition-colors"
                title="Cambiar entre Sistema A (React Router) y Sistema B (useState)"
              >
                <span>Cambiar a {activeSystem === 'router' ? 'Sistema B (State)' : 'Sistema A (Router)'}</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </button>
            )}
          </div>

          {/* Menú de Navegación y Acciones */}
          <div className="d-flex align-items-center gap-2 sm:gap-3">
            {isAuthenticated ? (
              <>
                <button
                  type="button"
                  onClick={() => handleNav('/dashboard')}
                  className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                    activeRoute.includes('dashboard')
                      ? 'bg-autumn-terracotta/10 text-autumn-terracotta dark:bg-autumn-terracotta/20 dark:text-autumn-terracotta-light font-semibold'
                      : 'text-autumn-warmbrown dark:text-autumn-darktext-primary hover:bg-autumn-beige-100 dark:hover:bg-autumn-darkbg-hover'
                  }`}
                >
                  Dashboard
                </button>

                <button
                  type="button"
                  onClick={() => handleNav('/profile')}
                  className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                    activeRoute.includes('profile')
                      ? 'bg-autumn-terracotta/10 text-autumn-terracotta dark:bg-autumn-terracotta/20 dark:text-autumn-terracotta-light font-semibold'
                      : 'text-autumn-warmbrown dark:text-autumn-darktext-primary hover:bg-autumn-beige-100 dark:hover:bg-autumn-darkbg-hover'
                  }`}
                >
                  Perfil ({user?.name ? user.name.split(' ')[0] : 'Usuario'})
                </button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="!px-3 !py-1 text-xs"
                >
                  Salir
                </Button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleNav('/login')}
                  className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                    activeRoute.includes('login')
                      ? 'text-autumn-terracotta dark:text-autumn-terracotta-light font-semibold'
                      : 'text-autumn-warmbrown dark:text-autumn-darktext-primary hover:bg-autumn-beige-100 dark:hover:bg-autumn-darkbg-hover'
                  }`}
                >
                  Iniciar Sesión
                </button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleNav('/register')}
                  className="!px-3.5 !py-1.5 text-xs sm:text-sm"
                >
                  Registrarse
                </Button>
              </>
            )}

            {/* Toggle Tema Claro / Oscuro */}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}

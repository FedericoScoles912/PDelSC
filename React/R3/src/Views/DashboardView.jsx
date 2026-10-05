import React from 'react';
import { useAuth } from '../Scripts/hooks/useAuth.js';
import Card from '../Components/Card.jsx';
import Button from '../Components/Button.jsx';

/**
 * Pantalla completa de Dashboard protegida
 * Aprovecha layouts amplios en 1920x1080 mediante grid responsivo
 */
export default function DashboardView({
  systemName = 'Sistema A · React Router',
  onNavigateToProfile,
  onSwitchSystem,
}) {
  const { user, logout } = useAuth();

  const formattedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Reciente';

  return (
    <div className="container py-8 sm:py-12">
      {/* Banner Principal de Bienvenida */}
      <div className="bg-gradient-to-r from-autumn-terracotta to-autumn-mustard rounded-3xl p-6 sm:p-10 text-white shadow-autumn dark:shadow-autumn-dark mb-8">
        <div className="row align-items-center g-4">
          <div className="col-12 col-lg-8">
            <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold uppercase tracking-wider mb-3">
              {systemName} — Sesión Activa
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              ¡Bienvenido/a, {user?.name || 'Usuario'}!
            </h1>
            <p className="mt-2 text-white/90 text-sm sm:text-base max-w-2xl leading-relaxed">
              Has ingresado correctamente al sistema de gestión de usuarios con persistencia en MySQL 8.0 y autenticación segura con tokens JWT.
            </p>
          </div>
          <div className="col-12 col-lg-4 text-lg-end">
            <div className="d-flex flex-wrap gap-2 justify-content-lg-end">
              <Button
                variant="olive"
                onClick={onNavigateToProfile}
                className="!text-white border border-white/20"
              >
                Editar Perfil
              </Button>
              {onSwitchSystem && (
                <button
                  type="button"
                  onClick={onSwitchSystem}
                  className="px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white text-sm font-medium transition-colors border border-white/20"
                >
                  Alternar Sistema
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Métricas y Características (Diseño óptimo para desktop 1920x1080) */}
      <div className="row g-4 mb-8">
        {/* Card 1: Datos de Sesión */}
        <div className="col-12 col-md-6 col-xl-3">
          <Card className="h-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-autumn-terracotta/10 dark:bg-autumn-terracotta/20 flex items-center justify-center text-autumn-terracotta dark:text-autumn-terracotta-light">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-autumn-warmbrown-light dark:text-autumn-darktext-secondary">
                Usuario
              </span>
            </div>
            <p className="text-lg font-bold text-autumn-warmbrown dark:text-autumn-darktext-primary truncate">
              {user?.name}
            </p>
            <p className="text-xs text-autumn-warmbrown-light dark:text-autumn-darktext-muted truncate mt-0.5">
              {user?.email}
            </p>
          </Card>
        </div>

        {/* Card 2: Base de Datos */}
        <div className="col-12 col-md-6 col-xl-3">
          <Card className="h-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-autumn-olive/10 dark:bg-autumn-olive/20 flex items-center justify-center text-autumn-olive dark:text-autumn-olive-light">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-autumn-warmbrown-light dark:text-autumn-darktext-secondary">
                Motor BBDD
              </span>
            </div>
            <p className="text-lg font-bold text-autumn-warmbrown dark:text-autumn-darktext-primary">
              MySQL 8.0
            </p>
            <p className="text-xs text-autumn-olive dark:text-autumn-olive-light font-medium mt-0.5">
              ● Conectado (mysql2 pool)
            </p>
          </Card>
        </div>

        {/* Card 3: Seguridad */}
        <div className="col-12 col-md-6 col-xl-3">
          <Card className="h-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-autumn-mustard/15 dark:bg-autumn-mustard/20 flex items-center justify-center text-autumn-mustard-dark dark:text-autumn-mustard-light">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-autumn-warmbrown-light dark:text-autumn-darktext-secondary">
                Criptografía
              </span>
            </div>
            <p className="text-lg font-bold text-autumn-warmbrown dark:text-autumn-darktext-primary">
              bcrypt + JWT
            </p>
            <p className="text-xs text-autumn-warmbrown-light dark:text-autumn-darktext-muted mt-0.5">
              10 salt rounds · Bearer token
            </p>
          </Card>
        </div>

        {/* Card 4: Antigüedad */}
        <div className="col-12 col-md-6 col-xl-3">
          <Card className="h-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-autumn-warmbrown/10 dark:bg-autumn-warmbrown-light/20 flex items-center justify-center text-autumn-warmbrown dark:text-autumn-darktext-primary">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-autumn-warmbrown-light dark:text-autumn-darktext-secondary">
                Registro
              </span>
            </div>
            <p className="text-lg font-bold text-autumn-warmbrown dark:text-autumn-darktext-primary">
              {formattedDate}
            </p>
            <p className="text-xs text-autumn-warmbrown-light dark:text-autumn-darktext-muted mt-0.5">
              Identificador UUID v4
            </p>
          </Card>
        </div>
      </div>

      {/* Detalles Técnicos y Comparativa de Arquitectura */}
      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <Card title="Detalles del Perfil y Seguridad" subtitle="Valores almacenados en la tabla users de MySQL">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <tbody>
                  <tr className="border-b border-autumn-beige-100 dark:border-autumn-darkbg-border/60">
                    <td className="py-3 font-semibold text-autumn-warmbrown-light dark:text-autumn-darktext-secondary w-1/3">
                      ID (UUID)
                    </td>
                    <td className="py-3 font-mono text-xs text-autumn-warmbrown dark:text-autumn-darktext-primary">
                      {user?.id}
                    </td>
                  </tr>
                  <tr className="border-b border-autumn-beige-100 dark:border-autumn-darkbg-border/60">
                    <td className="py-3 font-semibold text-autumn-warmbrown-light dark:text-autumn-darktext-secondary">
                      Nombre
                    </td>
                    <td className="py-3 text-autumn-warmbrown dark:text-autumn-darktext-primary">
                      {user?.name}
                    </td>
                  </tr>
                  <tr className="border-b border-autumn-beige-100 dark:border-autumn-darkbg-border/60">
                    <td className="py-3 font-semibold text-autumn-warmbrown-light dark:text-autumn-darktext-secondary">
                      Correo Electrónico
                    </td>
                    <td className="py-3 text-autumn-warmbrown dark:text-autumn-darktext-primary">
                      {user?.email}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-autumn-warmbrown-light dark:text-autumn-darktext-secondary">
                      Persistencia Local
                    </td>
                    <td className="py-3 text-autumn-olive dark:text-autumn-olive-light font-medium">
                      localStorage (user_auth_token)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="col-12 col-lg-4">
          <Card title="Acciones Rápidas" subtitle="Gestión de cuenta y navegación">
            <div className="d-flex flex-column gap-3">
              <Button
                variant="primary"
                onClick={onNavigateToProfile}
                className="w-100 justify-content-start"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Editar Información de Perfil
              </Button>

              {onSwitchSystem && (
                <Button
                  variant="secondary"
                  onClick={onSwitchSystem}
                  className="w-100 justify-content-start"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  Alternar Sistema Frontend
                </Button>
              )}

              <Button
                variant="outline"
                onClick={logout}
                className="w-100 justify-content-start !text-red-600 dark:!text-red-400 !border-red-300 dark:!border-red-900/50 hover:!bg-red-50 dark:hover:!bg-red-950/20"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Cerrar Sesión Segura
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

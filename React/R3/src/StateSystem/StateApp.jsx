import React, { useState, useEffect } from 'react';
import { useAuth } from '../Scripts/hooks/useAuth.js';
import Navbar from '../Components/Navbar.jsx';
import LoginView from '../Views/LoginView.jsx';
import RegisterView from '../Views/RegisterView.jsx';
import DashboardView from '../Views/DashboardView.jsx';
import ProfileView from '../Views/ProfileView.jsx';
import StateProtectedRoute from './StateProtectedRoute.jsx';

/**
 * Sistema B Completo: Navegación basada exclusivamente en useState puro
 * Sin depender de React Router. Las vistas se renderizan condicionalmente.
 */
export default function StateApp({ onSwitchSystem }) {
  const { isAuthenticated, loading } = useAuth();

  // Estado de la pantalla activa: 'login' | 'register' | 'dashboard' | 'profile'
  const [currentScreen, setCurrentScreen] = useState(() => {
    return isAuthenticated ? 'dashboard' : 'login';
  });

  // Efecto para sincronizar la pantalla con el estado de autenticación
  useEffect(() => {
    if (!loading) {
      if (isAuthenticated && (currentScreen === 'login' || currentScreen === 'register')) {
        setCurrentScreen('dashboard');
      } else if (!isAuthenticated && (currentScreen === 'dashboard' || currentScreen === 'profile')) {
        setCurrentScreen('login');
      }
    }
  }, [isAuthenticated, loading, currentScreen]);

  const navigateTo = (screen) => {
    // Normalizar si se pasa una ruta con slash o el nombre de pantalla directo
    const clean = screen.replace('/', '');
    setCurrentScreen(clean || 'dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col bg-autumn-beige-50 dark:bg-autumn-darkbg transition-colors">
      <Navbar
        systemName="Sistema B · useState Puro"
        activeSystem="state"
        onSwitchSystem={onSwitchSystem}
        onNavigate={navigateTo}
        activeRoute={currentScreen}
      />

      <main className="flex-1">
        {/* Renderizado condicional por switch / estado */}
        {currentScreen === 'login' && (
          <LoginView
            onNavigateToRegister={() => setCurrentScreen('register')}
            onLoginSuccess={() => setCurrentScreen('dashboard')}
          />
        )}

        {currentScreen === 'register' && (
          <RegisterView
            onNavigateToLogin={() => setCurrentScreen('login')}
            onRegisterSuccess={() => setCurrentScreen('dashboard')}
          />
        )}

        {currentScreen === 'dashboard' && (
          <StateProtectedRoute
            onNavigateToRegister={() => setCurrentScreen('register')}
            onLoginSuccess={() => setCurrentScreen('dashboard')}
          >
            <DashboardView
              systemName="Sistema B · useState Puro"
              onNavigateToProfile={() => setCurrentScreen('profile')}
              onSwitchSystem={onSwitchSystem}
            />
          </StateProtectedRoute>
        )}

        {currentScreen === 'profile' && (
          <StateProtectedRoute
            onNavigateToRegister={() => setCurrentScreen('register')}
            onLoginSuccess={() => setCurrentScreen('dashboard')}
          >
            <ProfileView
              onNavigateToDashboard={() => setCurrentScreen('dashboard')}
            />
          </StateProtectedRoute>
        )}
      </main>
    </div>
  );
}

export const STORAGE_KEYS = {
  TOKEN: 'user_auth_token',
  USER: 'user_auth_profile',
  THEME: 'user_auth_theme',
  ACTIVE_SYSTEM: 'user_auth_active_system',
};

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  DASHBOARD: '/dashboard',
};

export const SCREENS = {
  LOGIN: 'login',
  REGISTER: 'register',
  PROFILE: 'profile',
  DASHBOARD: 'dashboard',
};

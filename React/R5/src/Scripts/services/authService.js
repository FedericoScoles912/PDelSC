import { apiClient } from './apiClient.js';

/**
 * Servicio de autenticación tradicional (email + contraseña).
 *
 * Contratos del backend:
 *  - POST /register -> 201 { token, user }
 *  - POST /login    -> 200 { token, user }
 *  - POST /logout   -> 200 { message }
 */
export const authService = {
  async register({ name, email, password }) {
    const { data } = await apiClient.post('/register', { name, email, password });
    return data;
  },

  async login({ email, password }) {
    const { data } = await apiClient.post('/login', { email, password });
    return data;
  },

  async logout() {
    const { data } = await apiClient.post('/logout');
    return data;
  },
};

import { apiClient } from './apiClient.js';

/**
 * Servicio de usuario / perfil.
 *
 * Contratos del backend:
 *  - GET /profile -> { user }
 *  - PUT /profile -> { user }  (solo se envían los campos modificados)
 */
export const userService = {
  async getProfile() {
    const { data } = await apiClient.get('/profile');
    return data;
  },

  /**
   * Actualiza el perfil. Se omiten los campos vacíos para no pisar valores
   * existentes (el backend solo actualiza lo que recibe).
   */
  async updateProfile({ name, avatar_url, password } = {}) {
    const payload = {};
    if (typeof name === 'string' && name.trim()) payload.name = name.trim();
    if (typeof avatar_url === 'string' && avatar_url.trim()) payload.avatar_url = avatar_url.trim();
    if (typeof password === 'string' && password) payload.password = password;

    const { data } = await apiClient.put('/profile', payload);
    return data;
  },
};

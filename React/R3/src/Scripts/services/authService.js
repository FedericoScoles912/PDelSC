import api from './api.js';

export const authService = {
  /**
   * Registro de usuario
   * @param {{ name: string, email: string, password: string }} data
   */
  async register(data) {
    const response = await api.post('/register', data);
    return response.data;
  },

  /**
   * Inicio de sesión
   * @param {{ email: string, password: string }} credentials
   */
  async login(credentials) {
    const response = await api.post('/login', credentials);
    return response.data;
  },

  /**
   * Obtener perfil del usuario autenticado
   */
  async getProfile() {
    const response = await api.get('/profile');
    return response.data;
  },

  /**
   * Actualizar datos del perfil
   * @param {{ name: string, email: string, password?: string }} data
   */
  async updateProfile(data) {
    const response = await api.put('/profile', data);
    return response.data;
  },

  /**
   * Cierre de sesión en backend
   */
  async logout() {
    try {
      const response = await api.post('/logout');
      return response.data;
    } catch {
      // Ignorar fallo de red en logout, el cliente siempre descarta el token
      return { ok: true };
    }
  },
};

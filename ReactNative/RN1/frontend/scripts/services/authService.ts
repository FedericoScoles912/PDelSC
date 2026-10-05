import { apiClient } from './apiClient';
import { LoginCredentials, LoginSuccessResponse, User } from '../types';

/**
 * Servicio de Autenticación
 */
export const AuthService = {
  /**
   * Realiza la petición de inicio de sesión al endpoint /auth/login
   * @param credentials - Objeto con usuario/correo y contraseña
   * @returns Datos del usuario autenticado
   */
  async login(credentials: LoginCredentials): Promise<User> {
    const data = await apiClient<LoginSuccessResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (data.ok && data.usuario) {
      return data.usuario;
    }

    throw new Error('Respuesta inválida del servidor.');
  },

  /**
   * Verifica la conectividad con el backend
   */
  async checkHealth(): Promise<boolean> {
    try {
      const data = await apiClient<{ ok: boolean }>('/auth/health', {
        method: 'GET',
        timeoutMs: 4000,
      });
      return data.ok === true;
    } catch {
      return false;
    }
  },
};

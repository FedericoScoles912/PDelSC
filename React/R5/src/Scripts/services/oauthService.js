import { apiClient, API_URL } from './apiClient.js';

/**
 * Servicio OAuth 2.0.
 *
 * El navegador NUNCA ve el JWT en la URL: el backend redirige con un código
 * temporal de un solo uso y acá se canjea por el token final.
 *
 * Contratos del backend:
 *  - GET  /auth/:provider              -> 302 al proveedor (navegación del browser)
 *  - POST /auth/exchange               -> { token, user, status }
 *                                         | 400 { requiresEmail, profile }
 *                                         | 409 { message }
 *  - GET  /auth/linked-accounts        -> { accounts, hasPassword }
 *  - POST /auth/link/:provider         -> { authUrl, state }
 *  - DELETE /auth/link/:provider       -> { message, accounts, hasPassword }
 */
export const oauthService = {
  /**
   * URL absoluta para iniciar el login social.
   * `system` indica a qué sistema (A/B) debe volver el backend tras el callback.
   */
  buildLoginUrl(providerId, system) {
    const params = new URLSearchParams({ system });
    return `${API_URL}/auth/${providerId}?${params.toString()}`;
  },

  /** Canjea el código temporal por el JWT. `email` solo si el registro lo requiere. */
  async exchange(code, email) {
    const body = { code };
    if (email) body.email = email;

    const { data } = await apiClient.post('/auth/exchange', body);
    return data;
  },

  async getLinkedAccounts() {
    const { data } = await apiClient.get('/auth/linked-accounts');
    return data;
  },

  /** Pide la URL de autorización para VINCULAR un proveedor a la cuenta actual. */
  async requestLink(providerId, system) {
    const { data } = await apiClient.post(`/auth/link/${providerId}`, { system });
    return data;
  },

  async unlink(providerId) {
    const { data } = await apiClient.delete(`/auth/link/${providerId}`);
    return data;
  },
};

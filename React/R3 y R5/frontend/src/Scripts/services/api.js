import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Instancia de Axios configurada con:
 *  - baseURL común
 *  - withCredentials (necesario para que el navegador envíe la cookie httpOnly del refresh token)
 *  - interceptor request: adjunta access token en cabecera Authorization
 *  - interceptor response: si responde 401 intenta refresh/reintenta una vez; limpia sesión y redirige
 */
const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

const TOKEN_KEY = '__at__';
const UNAUTHORIZED_EVENT = 'auth:unauthorized';

/** Lee el access token desde memoria (no localStorage). */
export function getAccessToken() {
  return (typeof window !== 'undefined' && window[TOKEN_KEY]) || null;
}
/** Almacena el access token en memoria (se pierde al recargar). */
export function setAccessToken(token) {
  if (typeof window === 'undefined') return;
  window[TOKEN_KEY] = token || null;
}
export function clearAccessToken() {
  if (typeof window === 'undefined') return;
  delete window[TOKEN_KEY];
}

let isRefreshing = false;
let refreshSubscribers = [];

function onRefreshed(token) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(cb) {
  refreshSubscribers.push(cb);
}

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && !config.headers.get('Authorization')) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

api.interceptors.response.use(
  (resp) => resp,
  async (error) => {
    const originalRequest = error.config;
    const status = error?.response?.status;

    if (status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const { data } = await axios.post(`${baseURL}/auth/refresh`, {}, { withCredentials: true });
          if (data?.ok && data.accessToken) {
            setAccessToken(data.accessToken);
            onRefreshed(data.accessToken);
            originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
            return api(originalRequest);
          } else {
            throw new Error('refresh-invalid');
          }
        } catch (refreshErr) {
          clearAccessToken();
          onRefreshed(null);
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
          }
          return Promise.reject(refreshErr);
        } finally {
          isRefreshing = false;
        }
      }

      return new Promise((resolve, reject) => {
        addRefreshSubscriber((token) => {
          if (token) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          } else {
            reject(error);
          }
        });
      });
    }

    return Promise.reject(error);
  }
);

export const UNAUTHORIZED = UNAUTHORIZED_EVENT;
export default api;

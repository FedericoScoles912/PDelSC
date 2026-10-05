import { API_BASE_URL, API_TIMEOUT_MS } from '../utils/constants';

export interface RequestOptions extends RequestInit {
  timeoutMs?: number;
}

export class ApiError extends Error {
  public statusCode?: number;
  public details?: unknown;

  constructor(message: string, statusCode?: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Cliente HTTP base con soporte para timeouts, cancelación y manejo unificado de errores.
 */
export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { timeoutMs = API_TIMEOUT_MS, ...customOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  try {
    const response = await fetch(url, {
      ...customOptions,
      headers: {
        ...defaultHeaders,
        ...customOptions.headers,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    let data: unknown = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMsg =
        (data && typeof data === 'object' && 'mensaje' in data && typeof (data as { mensaje: unknown }).mensaje === 'string')
          ? (data as { mensaje: string }).mensaje
          : `Error en la petición: Código ${response.status} (${response.statusText})`;

      throw new ApiError(errorMsg, response.status, data);
    }

    return data as T;
  } catch (error: unknown) {
    clearTimeout(timeoutId);

    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError(
        'El servidor tardó demasiado en responder (Tiempo de espera agotado). Verifica la conexión.',
        408
      );
    }

    const message =
      error instanceof Error
        ? `No se pudo conectar al servidor: ${error.message}. Verifica que el backend esté encendido y la URL sea accesible.`
        : 'Error desconocido de red al contactar al servidor.';

    throw new ApiError(message, 0, error);
  }
}

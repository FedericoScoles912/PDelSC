/**
 * @file Slice de sesión. Concentra el estado de autenticación, los tokens y el
 *       usuario activo, y expone las operaciones asíncronas contra la API.
 *
 * Los tokens viven en memoria dentro de `servicios/api`; este slice se encarga
 * de persistirlos, de restaurar la sesión al arrancar y de reaccionar cuando el
 * cliente HTTP detecta que la sesión dejó de ser válida.
 * @module client/src/estado/sesionSlice
 */

import {
  createAsyncThunk,
  createSlice,
  type CaseReducer,
  type PayloadAction
} from '@reduxjs/toolkit';

import { CLAVES, guardar, obtener } from '../servicios/almacenamiento';
import {
  ErrorApi,
  cargarTokensGuardados,
  fijarTokens,
  limpiarTokens,
  peticion,
  tokensEnMemoria
} from '../servicios/api';
import type { EstadoSesion, SesionIniciada, Usuario } from './tipos';

/** Estado del slice de sesión. */
export interface EstadoSesionSlice {
  /** Situación actual de la sesión. */
  estado: EstadoSesion;
  /** Usuario autenticado (o `null`). */
  usuario: Usuario | null;
  /** `true` mientras corre una operación de sesión. */
  cargando: boolean;
  /** Último mensaje de error legible (o `null`). */
  error: string | null;
}

const ESTADO_INICIAL: EstadoSesionSlice = {
  estado: 'inicial',
  usuario: null,
  cargando: false,
  error: null
};

/** Traduce cualquier excepción a un mensaje legible para el usuario. */
function mensajeDeError(error: unknown): string {
  if (error instanceof ErrorApi) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return 'Ocurrió un error inesperado. Intentá nuevamente.';
}

/** Serializa el usuario para el almacenamiento persistente. */
async function persistirUsuario(usuario: Usuario | null): Promise<void> {
  if (usuario) {
    await guardar(CLAVES.usuario, JSON.stringify(usuario));
  } else {
    await guardar(CLAVES.usuario, '');
  }
}

/** Lee el usuario persistido, ignorando valores corruptos. */
async function leerUsuarioGuardado(): Promise<Usuario | null> {
  const crudo = await obtener(CLAVES.usuario);
  if (!crudo) return null;
  try {
    return JSON.parse(crudo) as Usuario;
  } catch {
    return null;
  }
}

/** Fija los tokens en memoria y los persiste. */
async function aplicarTokens(accessToken: string, refreshToken: string): Promise<void> {
  fijarTokens(accessToken, refreshToken);
  await guardar(CLAVES.accessToken, accessToken);
  await guardar(CLAVES.refreshToken, refreshToken);
}

/**
 * Restaura la sesión al arrancar la aplicación.
 *
 * Carga los tokens persistidos y valida la sesión contra `/auth/perfil`
 * (el cliente renueva el access token automáticamente si expiró). Ante un
 * error de red conserva el usuario guardado para permitir el reintento.
 * @returns El usuario vigente, o `null` si no hay sesión válida.
 */
export const restaurarSesion = createAsyncThunk<Usuario | null>('sesion/restaurar', async () => {
  await cargarTokensGuardados();
  const { acceso, refresco } = tokensEnMemoria();
  const guardado = await leerUsuarioGuardado();

  if (!acceso || !refresco) {
    await limpiarTokens();
    return null;
  }

  try {
    const perfil = await peticion<Usuario>('/auth/perfil');
    await persistirUsuario(perfil);
    return perfil;
  } catch (error) {
    if (error instanceof ErrorApi && (error.estado === 401 || error.estado === 403)) {
      await limpiarTokens();
      fijarTokens(null, null);
      return null;
    }
    // Sin conexión: se mantiene la sesión previa para no expulsar al usuario.
    return guardado;
  }
});

/** Inicia sesión con email y contraseña. */
export const iniciarSesion = createAsyncThunk<
  SesionIniciada,
  { email: string; password: string },
  { rejectValue: string }
>('sesion/iniciar', async (credenciales, { rejectWithValue }) => {
  try {
    const datos = await peticion<SesionIniciada>('/auth/login', {
      metodo: 'POST',
      autenticada: false,
      cuerpo: credenciales
    });
    await aplicarTokens(datos.accessToken, datos.refreshToken);
    await persistirUsuario(datos.usuario);
    return datos;
  } catch (error) {
    return rejectWithValue(mensajeDeError(error));
  }
});

/** Inicia sesión con un proveedor OAuth (Google, Facebook, GitHub). */
export const iniciarSesionOAuth = createAsyncThunk<
  SesionIniciada,
  { proveedor: 'google' | 'facebook' | 'github'; token: string },
  { rejectValue: string }
>('sesion/iniciarOAuth', async ({ proveedor, token }, { rejectWithValue }) => {
  try {
    const datos = await peticion<SesionIniciada>(`/auth/oauth/${proveedor}`, {
      metodo: 'POST',
      autenticada: false,
      cuerpo: { token }
    });
    await aplicarTokens(datos.accessToken, datos.refreshToken);
    await persistirUsuario(datos.usuario);
    return datos;
  } catch (error) {
    return rejectWithValue(mensajeDeError(error));
  }
});

/** Cierra la sesión y revoca el refresh token en el servidor. */
export const cerrarSesion = createAsyncThunk('sesion/cerrar', async () => {
  const { refresco } = tokensEnMemoria();
  if (refresco) {
    try {
      await peticion('/auth/logout', { metodo: 'POST', cuerpo: { refreshToken: refresco } });
    } catch {
      /* el cierre local continúa aunque el servidor no responda */
    }
  }
  fijarTokens(null, null);
  await limpiarTokens();
});

/** Actualiza nombre, apellido y teléfono del usuario autenticado. */
export const actualizarPerfil = createAsyncThunk<
  Usuario,
  { nombre?: string; apellido?: string; telefono?: string },
  { rejectValue: string }
>('sesion/actualizarPerfil', async (cambios, { rejectWithValue }) => {
  try {
    const perfil = await peticion<Usuario>('/auth/perfil', { metodo: 'PATCH', cuerpo: cambios });
    await persistirUsuario(perfil);
    return perfil;
  } catch (error) {
    return rejectWithValue(mensajeDeError(error));
  }
});

/** Marca el inicio de una operación de login. */
const iniciarSesionPendiente: CaseReducer<EstadoSesionSlice> = (estado) => {
  estado.cargando = true;
  estado.error = null;
};

/** Registra la sesión recién iniciada. */
const iniciarSesionCompletada: CaseReducer<EstadoSesionSlice, PayloadAction<SesionIniciada>> = (
  estado,
  accion
) => {
  estado.cargando = false;
  estado.usuario = accion.payload.usuario;
  estado.estado = 'autenticado';
};

/** Registra el fallo del login con su mensaje legible. */
const iniciarSesionFallida: CaseReducer<EstadoSesionSlice, PayloadAction<string | undefined>> = (
  estado,
  accion
) => {
  estado.cargando = false;
  estado.error =
    typeof accion.payload === 'string' ? accion.payload : 'No se pudo iniciar sesión.';
};

const slice = createSlice({
  name: 'sesion',
  initialState: ESTADO_INICIAL,
  reducers: {
    /** Marca la sesión como cerrada (usado al detectar un token inválido). */
    sesionPerdida(estado) {
      estado.estado = 'anonimo';
      estado.usuario = null;
      estado.cargando = false;
      estado.error = null;
    },
    /** Descarta el último error registrado. */
    limpiarError(estado) {
      estado.error = null;
    }
  },
  extraReducers: (constructor) => {
    constructor
      .addCase(restaurarSesion.pending, (estado) => {
        estado.cargando = true;
        estado.error = null;
      })
      .addCase(restaurarSesion.fulfilled, (estado, accion) => {
        estado.cargando = false;
        estado.usuario = accion.payload;
        estado.estado = accion.payload ? 'autenticado' : 'anonimo';
      })
      .addCase(restaurarSesion.rejected, (estado) => {
        estado.cargando = false;
        estado.usuario = null;
        estado.estado = 'anonimo';
      });

    constructor
      .addCase(iniciarSesion.pending, iniciarSesionPendiente)
      .addCase(iniciarSesion.fulfilled, iniciarSesionCompletada)
      .addCase(iniciarSesion.rejected, iniciarSesionFallida)
      .addCase(iniciarSesionOAuth.pending, iniciarSesionPendiente)
      .addCase(iniciarSesionOAuth.fulfilled, iniciarSesionCompletada)
      .addCase(iniciarSesionOAuth.rejected, iniciarSesionFallida);

    constructor
      .addCase(cerrarSesion.pending, (estado) => {
        estado.cargando = true;
      })
      .addCase(cerrarSesion.fulfilled, (estado) => {
        estado.cargando = false;
        estado.usuario = null;
        estado.estado = 'anonimo';
        estado.error = null;
      })
      .addCase(cerrarSesion.rejected, (estado) => {
        estado.cargando = false;
        estado.usuario = null;
        estado.estado = 'anonimo';
        estado.error = null;
      })
      .addCase(actualizarPerfil.fulfilled, (estado, accion) => {
        estado.usuario = accion.payload;
      });
  }
});

export const { sesionPerdida, limpiarError } = slice.actions;

export default slice.reducer;

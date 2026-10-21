/**
 * authSlice.js
 * Sesión del usuario: tokens, datos y estado. Persiste en SecureStore/localStorage.
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { rawApi, normalizeError } from '../../Services/http';
import { ENDPOINTS } from '../../Services/apiConfig';
import { saveSession, loadSession, clearSession } from '../../Services/storage';

const initialState = {
  usuario: null,
  accessToken: null,
  refreshToken: null,
  status: 'idle', // idle | loading | authenticated | unauthenticated
  inicializado: false,
  error: null,
};

// ------------------------------- Thunks -----------------------------------
export const login = createAsyncThunk('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    const { data } = await rawApi.post(ENDPOINTS.login, { email, password });
    return data.data; // { usuario, accessToken, refreshToken }
  } catch (err) {
    return rejectWithValue(normalizeError(err));
  }
});

export const register = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await rawApi.post(ENDPOINTS.register, payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(normalizeError(err));
  }
});

export const loginSocial = createAsyncThunk('auth/loginSocial', async ({ proveedor, token }, { rejectWithValue }) => {
  try {
    const { data } = await rawApi.post(ENDPOINTS.social(proveedor), { token });
    return data.data;
  } catch (err) {
    return rejectWithValue(normalizeError(err));
  }
});

/** Restaura la sesión guardada y valida el token contra /auth/me. */
export const bootstrap = createAsyncThunk('auth/bootstrap', async (_, { rejectWithValue, dispatch }) => {
  const saved = await loadSession();
  if (!saved?.refreshToken && !saved?.accessToken) return rejectWithValue({ message: 'sin_sesion' });
  try {
    const { data } = await rawApi.get(ENDPOINTS.me, {
      headers: { Authorization: `Bearer ${saved.accessToken}` },
    });
    dispatch(setTokens({ accessToken: saved.accessToken, refreshToken: saved.refreshToken }));
    return { usuario: data.data, accessToken: saved.accessToken, refreshToken: saved.refreshToken };
  } catch {
    // Access token vencido: intentamos refrescar
    try {
      const { data } = await rawApi.post(ENDPOINTS.refresh, { refreshToken: saved.refreshToken });
      const tokens = data.data;
      const me = await rawApi.get(ENDPOINTS.me, {
        headers: { Authorization: `Bearer ${tokens.accessToken}` },
      });
      const session = { usuario: me.data.data, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
      await saveSession(session);
      dispatch(setTokens({ accessToken: session.accessToken, refreshToken: session.refreshToken }));
      return session;
    } catch {
      await clearSession();
      return rejectWithValue({ message: 'sesion_expirada' });
    }
  }
});

/** Cierra sesión (revoca el refresh token en el backend, best-effort). */
export const logout = createAsyncThunk('auth/logout', async (_, { getState }) => {
  const { refreshToken } = getState().auth;
  try {
    if (refreshToken) await rawApi.post(ENDPOINTS.logout, { refreshToken });
  } catch {
    /* best-effort */
  }
  await clearSession();
});

// ------------------------------- Slice ------------------------------------
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setTokens(state, action) {
      state.accessToken = action.payload.accessToken ?? state.accessToken;
      state.refreshToken = action.payload.refreshToken ?? state.refreshToken;
    },
    setUsuario(state, action) {
      state.usuario = action.payload;
    },
    clearSession(state) {
      state.usuario = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.status = 'unauthenticated';
      state.error = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const onSession = (state, action) => {
      state.status = 'authenticated';
      state.error = null;
      state.usuario = action.payload.usuario;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      saveSession(action.payload);
    };

    builder
      .addCase(login.pending, (s) => { s.status = 'loading'; s.error = null; })
      .addCase(login.fulfilled, onSession)
      .addCase(login.rejected, (s, a) => { s.status = 'unauthenticated'; s.error = a.payload?.message || 'No se pudo iniciar sesión'; })

      .addCase(register.pending, (s) => { s.status = 'loading'; s.error = null; })
      .addCase(register.fulfilled, onSession)
      .addCase(register.rejected, (s, a) => { s.status = 'unauthenticated'; s.error = a.payload?.message || 'No se pudo registrar'; })

      .addCase(loginSocial.pending, (s) => { s.status = 'loading'; s.error = null; })
      .addCase(loginSocial.fulfilled, onSession)
      .addCase(loginSocial.rejected, (s, a) => { s.status = 'unauthenticated'; s.error = a.payload?.message || 'No se pudo autenticar'; })

      .addCase(bootstrap.pending, (s) => { s.status = 'loading'; })
      .addCase(bootstrap.fulfilled, (s, a) => {
        s.status = 'authenticated';
        s.usuario = a.payload.usuario;
        s.accessToken = a.payload.accessToken;
        s.refreshToken = a.payload.refreshToken;
        s.inicializado = true;
      })
      .addCase(bootstrap.rejected, (s) => {
        s.status = 'unauthenticated';
        s.inicializado = true;
      })

      .addCase(logout.fulfilled, (s) => {
        s.usuario = null; s.accessToken = null; s.refreshToken = null; s.status = 'unauthenticated';
      });
  },
});

export const { setTokens, setUsuario, clearSession: clearSessionAction, clearError } = authSlice.actions;
export default authSlice.reducer;

/**
 * apiSlice.js
 * Capa de datos con RTK Query. Centraliza TODAS las llamadas al API /api/v1.
 *
 * Base query con re-autenticación:
 *  - Adjunta el Bearer token desde el estado de auth.
 *  - Si el backend responde 401, intenta refrescar el token una sola vez
 *    (evitando refrescos simultáneos) y reintenta la petición original.
 *  - Si el refresh falla, limpia la sesión.
 */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL, ENDPOINTS } from '../Services/apiConfig';
import { saveSession, clearSession } from '../Services/storage';
import { setTokens, clearSessionAction } from './slices/authSlice';

const baseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth?.accessToken;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

// Promesa compartida para que varios 401 no disparen varios refresh.
let refreshPromise = null;

async function refreshSession(api, extraOptions) {
  const { refreshToken, usuario } = api.getState().auth || {};
  if (!refreshToken) return null;

  const res = await baseQuery(
    { url: ENDPOINTS.refresh, method: 'POST', body: { refreshToken } },
    api,
    extraOptions,
  );

  const tokens = res.data?.data;
  if (tokens?.accessToken) {
    api.dispatch(setTokens(tokens));
    await saveSession({ usuario, ...tokens });
    return tokens.accessToken;
  }

  await clearSession();
  api.dispatch(clearSessionAction());
  return null;
}

async function baseQueryWithReauth(args, api, extraOptions) {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    if (!refreshPromise) {
      refreshPromise = refreshSession(api, extraOptions).finally(() => {
        refreshPromise = null;
      });
    }
    const token = await refreshPromise;
    if (token) result = await baseQuery(args, api, extraOptions);
  }

  return result;
}

/** Serializa un objeto plano a query string, omitiendo valores vacíos. */
function toQuery(params = {}) {
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  return qs ? `?${qs}` : '';
}

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Producto', 'Categoria', 'Movimiento', 'Precio', 'Usuario', 'Rol', 'Auditoria', 'Config', 'Dashboard'],
  keepUnusedDataFor: 60,
  endpoints: (builder) => ({
    // ------------------------------ Dashboard -------------------------------
    getDashboard: builder.query({
      query: () => ENDPOINTS.dashboard,
      providesTags: ['Dashboard'],
    }),
    getAlertas: builder.query({
      query: () => ENDPOINTS.alertas,
      providesTags: ['Dashboard'],
    }),

    // ------------------------------ Productos -------------------------------
    getProductos: builder.query({
      query: (params) => `${ENDPOINTS.productos}${toQuery(params)}`,
      providesTags: (r) => ['Producto', ...(r?.data?.items || []).map((p) => ({ type: 'Producto', id: p.id }))],
    }),
    buscarProductos: builder.query({
      query: (params) => `${ENDPOINTS.productosBuscar}${toQuery(params)}`,
      providesTags: ['Producto'],
    }),
    getProducto: builder.query({
      query: (id) => `${ENDPOINTS.productos}/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Producto', id }],
    }),
    crearProducto: builder.mutation({
      query: (body) => ({ url: ENDPOINTS.productos, method: 'POST', body }),
      invalidatesTags: ['Producto', 'Dashboard'],
    }),
    actualizarProducto: builder.mutation({
      query: ({ id, ...body }) => ({ url: `${ENDPOINTS.productos}/${id}`, method: 'PUT', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Producto', id }, 'Producto', 'Dashboard'],
    }),
    eliminarProducto: builder.mutation({
      query: (id) => ({ url: `${ENDPOINTS.productos}/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Producto', 'Dashboard'],
    }),
    setStockMinimo: builder.mutation({
      query: ({ id, stockMinimo }) => ({
        url: `${ENDPOINTS.productos}/${id}/stock-minimo`,
        method: 'PATCH',
        body: { stockMinimo },
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Producto', id }, 'Producto', 'Dashboard'],
    }),

    // ------------------------------ Categorías ------------------------------
    getCategorias: builder.query({
      query: () => ENDPOINTS.categoria,
      providesTags: ['Categoria'],
    }),
    crearCategoria: builder.mutation({
      query: (body) => ({ url: ENDPOINTS.categoria, method: 'POST', body }),
      invalidatesTags: ['Categoria'],
    }),
    actualizarCategoria: builder.mutation({
      query: ({ id, ...body }) => ({ url: `${ENDPOINTS.categoria}/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Categoria'],
    }),
    eliminarCategoria: builder.mutation({
      query: (id) => ({ url: `${ENDPOINTS.categoria}/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Categoria'],
    }),

    // ------------------------------ Movimientos -----------------------------
    getMovimientos: builder.query({
      query: (params) => `${ENDPOINTS.movimientos}${toQuery(params)}`,
      providesTags: ['Movimiento'],
    }),
    getUltimosMovimientos: builder.query({
      query: (limit = 5) => `${ENDPOINTS.movimientosUltimos}${toQuery({ limit })}`,
      providesTags: ['Movimiento'],
    }),
    registrarMovimiento: builder.mutation({
      query: (body) => ({ url: ENDPOINTS.movimientos, method: 'POST', body }),
      invalidatesTags: ['Movimiento', 'Producto', 'Dashboard'],
    }),

    // -------------------------------- Precios -------------------------------
    getPrecioHistorial: builder.query({
      query: ({ id, ...params }) => `${ENDPOINTS.precios}/producto/${id}/historial${toQuery(params)}`,
      providesTags: (_r, _e, { id }) => [{ type: 'Precio', id }],
    }),
    actualizarPrecio: builder.mutation({
      query: ({ id, ...body }) => ({ url: `${ENDPOINTS.precios}/producto/${id}`, method: 'PUT', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Precio', id }, { type: 'Producto', id }, 'Producto', 'Dashboard'],
    }),

    // ------------------------------- Reportes -------------------------------
    getReporteStock: builder.query({
      query: (params) => `${ENDPOINTS.reportes}/stock${toQuery(params)}`,
      providesTags: ['Producto'],
    }),
    getReporteMovimientos: builder.query({
      query: (params) => `${ENDPOINTS.reportes}/movimientos${toQuery(params)}`,
      providesTags: ['Movimiento'],
    }),
    getReporteValor: builder.query({
      query: () => `${ENDPOINTS.reportes}/valor`,
      providesTags: ['Dashboard'],
    }),

    // -------------------------------- Usuarios ------------------------------
    getUsuarios: builder.query({
      query: (params) => `${ENDPOINTS.usuarios}${toQuery(params)}`,
      providesTags: ['Usuario'],
    }),
    getUsuario: builder.query({
      query: (id) => `${ENDPOINTS.usuarios}/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Usuario', id }],
    }),
    crearUsuario: builder.mutation({
      query: (body) => ({ url: ENDPOINTS.usuarios, method: 'POST', body }),
      invalidatesTags: ['Usuario'],
    }),
    actualizarUsuario: builder.mutation({
      query: ({ id, ...body }) => ({ url: `${ENDPOINTS.usuarios}/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Usuario'],
    }),
    setUsuarioEstado: builder.mutation({
      query: ({ id, activo }) => ({ url: `${ENDPOINTS.usuarios}/${id}/estado`, method: 'PATCH', body: { activo } }),
      invalidatesTags: ['Usuario'],
    }),
    setUsuarioRol: builder.mutation({
      query: ({ id, rolId }) => ({ url: `${ENDPOINTS.usuarios}/${id}/rol`, method: 'PATCH', body: { rolId } }),
      invalidatesTags: ['Usuario'],
    }),
    eliminarUsuario: builder.mutation({
      query: (id) => ({ url: `${ENDPOINTS.usuarios}/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Usuario'],
    }),
    getRoles: builder.query({
      query: () => ENDPOINTS.roles,
      providesTags: ['Rol'],
    }),

    // ------------------------------- Auditoría ------------------------------
    getAuditoria: builder.query({
      query: (params) => `${ENDPOINTS.auditoria}${toQuery(params)}`,
      providesTags: ['Auditoria'],
    }),

    // ----------------------------- Configuración ----------------------------
    getConfig: builder.query({
      query: () => ENDPOINTS.config,
      providesTags: ['Config'],
    }),
    getConfigPublica: builder.query({
      query: () => `${ENDPOINTS.config}/publica`,
    }),
    actualizarConfig: builder.mutation({
      query: ({ clave, valor }) => ({ url: `${ENDPOINTS.config}/${clave}`, method: 'PUT', body: { valor } }),
      invalidatesTags: ['Config'],
    }),

    // ------------------------------ Importación -----------------------------
    importarPreview: builder.mutation({
      query: (formData) => ({ url: `${ENDPOINTS.import}/preview`, method: 'POST', body: formData }),
    }),
    importarConfirmar: builder.mutation({
      query: (formData) => ({ url: `${ENDPOINTS.import}/confirm`, method: 'POST', body: formData }),
      invalidatesTags: ['Producto', 'Categoria', 'Precio', 'Dashboard'],
    }),
  }),
});

export const {
  useGetDashboardQuery,
  useGetAlertasQuery,
  useGetProductosQuery,
  useBuscarProductosQuery,
  useGetProductoQuery,
  useCrearProductoMutation,
  useActualizarProductoMutation,
  useEliminarProductoMutation,
  useSetStockMinimoMutation,
  useGetCategoriasQuery,
  useCrearCategoriaMutation,
  useActualizarCategoriaMutation,
  useEliminarCategoriaMutation,
  useGetMovimientosQuery,
  useGetUltimosMovimientosQuery,
  useRegistrarMovimientoMutation,
  useGetPrecioHistorialQuery,
  useActualizarPrecioMutation,
  useGetReporteStockQuery,
  useGetReporteMovimientosQuery,
  useGetReporteValorQuery,
  useGetUsuariosQuery,
  useGetUsuarioQuery,
  useCrearUsuarioMutation,
  useActualizarUsuarioMutation,
  useSetUsuarioEstadoMutation,
  useSetUsuarioRolMutation,
  useEliminarUsuarioMutation,
  useGetRolesQuery,
  useGetAuditoriaQuery,
  useGetConfigQuery,
  useGetConfigPublicaQuery,
  useActualizarConfigMutation,
  useImportarPreviewMutation,
  useImportarConfirmarMutation,
  useLazyBuscarProductosQuery,
} = apiSlice;

export default apiSlice;

/**
 * index.js
 * Configuración del store de Redux (Redux Toolkit + RTK Query).
 */
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authReducer from './slices/authSlice';
import themeReducer from './slices/themeSlice';
import { apiSlice } from './apiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(apiSlice.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

// Habilita refetchOnFocus / refetchOnReconnect.
setupListeners(store.dispatch);

export default store;

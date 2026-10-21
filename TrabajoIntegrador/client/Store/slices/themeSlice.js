/**
 * themeSlice.js
 * Modo de tema: 'system' | 'light' | 'dark'.
 */
import { createSlice } from '@reduxjs/toolkit';

const initialState = { mode: 'system' };

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setMode(state, action) {
      state.mode = action.payload;
    },
    toggleDark(state) {
      state.mode = state.mode === 'dark' ? 'light' : 'dark';
    },
  },
});

export const { setMode, toggleDark } = themeSlice.actions;
export default themeSlice.reducer;

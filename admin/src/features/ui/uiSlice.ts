import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { STORAGE_KEYS } from '../../utils/constants';
import { storage } from '../../utils/storage';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

interface UiState {
  sidebarCollapsed: boolean;
  theme: 'dark' | 'light';
  toasts: ToastItem[];
}

const savedTheme = storage.getString(STORAGE_KEYS.THEME, 'dark') as 'dark' | 'light';
const savedSidebar = storage.get<boolean>(STORAGE_KEYS.SIDEBAR, false);

const initialState: UiState = {
  sidebarCollapsed: savedSidebar,
  theme: savedTheme === 'light' ? 'light' : 'dark',
  toasts: [],
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
      storage.set(STORAGE_KEYS.SIDEBAR, state.sidebarCollapsed);
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
      storage.set(STORAGE_KEYS.SIDEBAR, action.payload);
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      storage.set(STORAGE_KEYS.THEME, state.theme);
      document.documentElement.setAttribute('data-theme', state.theme);
    },
    setTheme: (state, action: PayloadAction<'dark' | 'light'>) => {
      state.theme = action.payload;
      storage.set(STORAGE_KEYS.THEME, action.payload);
      document.documentElement.setAttribute('data-theme', action.payload);
    },
    addToast: (state, action: PayloadAction<Omit<ToastItem, 'id'>>) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      state.toasts.push({
        id,
        duration: action.payload.duration ?? 4000,
        ...action.payload,
      });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
  },
});

export const {
  toggleSidebar,
  setSidebarCollapsed,
  toggleTheme,
  setTheme,
  addToast,
  removeToast,
} = uiSlice.actions;

export default uiSlice.reducer;

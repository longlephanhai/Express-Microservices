import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, LoginCredentials, AdminUser } from '../../types';
import { authApi } from '../../api/authApi';
import { STORAGE_KEYS } from '../../utils/constants';
import { storage } from '../../utils/storage';

const storedToken = storage.getString(STORAGE_KEYS.TOKEN, '');
const storedUser = storage.get<AdminUser | null>(STORAGE_KEYS.USER, null);

const initialState: AuthState = {
  user: storedUser,
  token: storedToken || null,
  isAuthenticated: Boolean(storedToken),
  status: 'idle',
  error: null,
};

export const loginAsync = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials);
      storage.set(STORAGE_KEYS.TOKEN, response.token);
      storage.set(STORAGE_KEYS.USER, response.user);
      return response;
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err && (err as { response?: { data?: { error?: string; message?: string } } }).response?.data?.message
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.';
      return rejectWithValue(message);
    }
  }
);

export const fetchProfileAsync = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const profile = await authApi.getProfile();
      storage.set(STORAGE_KEYS.USER, profile);
      return profile;
    } catch (err: unknown) {
      return rejectWithValue('Không thể tải thông tin quản trị viên');
    }
  }
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.status = 'idle';
      state.error = null;
      storage.remove(STORAGE_KEYS.TOKEN);
      storage.remove(STORAGE_KEYS.USER);
    },
    clearError: (state) => {
      state.error = null;
    },
    // Mock login action for easy developer demo/preview
    setDemoAdmin: (state) => {
      const demoUser: AdminUser = {
        id: 'usr-admin-demo-001',
        email: 'admin@microservices.local',
        username: 'SystemAdministrator',
        firstName: 'Admin',
        lastName: 'Express',
        role: 'superadmin',
      };
      const demoToken = 'mock-jwt-token-admin-session-xyz';
      state.user = demoUser;
      state.token = demoToken;
      state.isAuthenticated = true;
      state.status = 'succeeded';
      state.error = null;
      storage.set(STORAGE_KEYS.TOKEN, demoToken);
      storage.set(STORAGE_KEYS.USER, demoUser);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAsync.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) || 'Đăng nhập thất bại';
      })
      .addCase(fetchProfileAsync.fulfilled, (state, action: PayloadAction<AdminUser>) => {
        state.user = action.payload;
      });
  },
});

export const { logout, clearError, setDemoAdmin } = authSlice.actions;
export default authSlice.reducer;

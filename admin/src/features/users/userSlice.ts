import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { UserAccount, UserState, UserFilters } from '../../types';
import { userApi } from '../../api/userApi';
import { MOCK_USERS } from '../../utils/mockData';

const initialState: UserState = {
  items: MOCK_USERS,
  selectedUser: null,
  filters: {
    role: '',
    status: '',
    search: '',
    page: 1,
    limit: 10,
  },
  paging: {
    page: 1,
    limit: 10,
    total: MOCK_USERS.length,
  },
  status: 'idle',
  error: null,
};

export const fetchUsersAsync = createAsyncThunk(
  'users/fetchUsers',
  async (filters: UserFilters | undefined) => {
    try {
      const res = await userApi.getUsers(filters);
      return res;
    } catch {
      return {
        data: MOCK_USERS,
        paging: { page: 1, limit: 10, total: MOCK_USERS.length },
      };
    }
  }
);

export const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setUserFilters: (state, action: PayloadAction<Partial<UserFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setSelectedUser: (state, action: PayloadAction<UserAccount | null>) => {
      state.selectedUser = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsersAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUsersAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (Array.isArray(action.payload.data) && action.payload.data.length > 0) {
          state.items = action.payload.data;
          state.paging.total = action.payload.paging?.total ?? action.payload.data.length;
        }
      })
      .addCase(fetchUsersAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) || 'Không thể tải người dùng';
      });
  },
});

export const { setUserFilters, setSelectedUser } = userSlice.actions;
export default userSlice.reducer;

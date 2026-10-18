import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { UserAccount, UserState, UserFilters } from '../../types';
import { userApi } from '../../api/userApi';

const initialState: UserState = {
  items: [],
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
    total: 0,
  },
  status: 'idle',
  error: null,
};

export const fetchUsersAsync = createAsyncThunk(
  'users/fetchUsers',
  async (filters: UserFilters | undefined, { rejectWithValue }) => {
    try {
      const res = await userApi.getUsers(filters);
      return res;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Không thể tải danh sách người dùng');
    }
  }
);

export const updateUserAsync = createAsyncThunk(
  'users/updateUser',
  async ({ id, input }: { id: string; input: Partial<UserAccount> }, { rejectWithValue }) => {
    try {
      await userApi.updateUser(id, input);
      return { id, input };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Không thể cập nhật người dùng');
    }
  }
);

export const deleteUserAsync = createAsyncThunk(
  'users/deleteUser',
  async (id: string, { rejectWithValue }) => {
    try {
      await userApi.deleteUser(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Không thể xóa người dùng');
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
      // Fetch users
      .addCase(fetchUsersAsync.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchUsersAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.data || [];
        state.paging.total = action.payload.paging?.total ?? (action.payload.data?.length || 0);
      })
      .addCase(fetchUsersAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) || 'Không thể tải người dùng';
      })
      // Update user
      .addCase(updateUserAsync.fulfilled, (state, action) => {
        const { id, input } = action.payload;
        const index = state.items.findIndex((u) => u.id === id);
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...input };
        }
        if (state.selectedUser?.id === id) {
          state.selectedUser = { ...state.selectedUser, ...input };
        }
      })
      // Delete user
      .addCase(deleteUserAsync.fulfilled, (state, action) => {
        state.items = state.items.filter((u) => u.id !== action.payload);
        if (state.selectedUser?.id === action.payload) {
          state.selectedUser = null;
        }
      });
  },
});

export const { setUserFilters, setSelectedUser } = userSlice.actions;
export default userSlice.reducer;

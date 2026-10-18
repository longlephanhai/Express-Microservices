import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Category, CategoryState, CategoryCreateInput, CategoryUpdateInput } from '../../types';
import { categoryApi } from '../../api/categoryApi';

const initialState: CategoryState = {
  items: [],
  selectedCategory: null,
  status: 'idle',
  error: null,
};

export const fetchCategoriesAsync = createAsyncThunk(
  'categories/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const res = await categoryApi.getCategories();
      return res;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Không thể tải danh mục');
    }
  }
);

export const createCategoryAsync = createAsyncThunk(
  'categories/createCategory',
  async (input: CategoryCreateInput, { rejectWithValue }) => {
    try {
      const res = await categoryApi.createCategory(input);
      const createdId = typeof res.data === 'string' ? res.data : (res.data as any)?.id || `c-${Date.now()}`;
      return { id: createdId, input };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Không thể tạo danh mục');
    }
  }
);

export const updateCategoryAsync = createAsyncThunk(
  'categories/updateCategory',
  async ({ id, input }: { id: string; input: CategoryUpdateInput }, { rejectWithValue }) => {
    try {
      await categoryApi.updateCategory(id, input);
      return { id, input };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Không thể cập nhật danh mục');
    }
  }
);

export const deleteCategoryAsync = createAsyncThunk(
  'categories/deleteCategory',
  async (id: string, { rejectWithValue }) => {
    try {
      await categoryApi.deleteCategory(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Không thể xóa danh mục');
    }
  }
);

export const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    setSelectedCategory: (state, action: PayloadAction<Category | null>) => {
      state.selectedCategory = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategoriesAsync.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCategoriesAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.data || [];
      })
      .addCase(fetchCategoriesAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) || 'Không thể tải danh mục';
      })
      .addCase(createCategoryAsync.fulfilled, (state, action) => {
        const { id, input } = action.payload;
        const newCategory: Category = {
          id,
          ...input,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        state.items.unshift(newCategory);
      })
      .addCase(updateCategoryAsync.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = {
            ...state.items[index],
            ...action.payload.input,
            updatedAt: new Date().toISOString(),
          };
        }
      })
      .addCase(deleteCategoryAsync.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      });
  },
});

export const { setSelectedCategory } = categorySlice.actions;
export default categorySlice.reducer;

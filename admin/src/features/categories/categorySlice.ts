import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Category, CategoryState, CategoryCreateInput, CategoryUpdateInput } from '../../types';
import { categoryApi } from '../../api/categoryApi';
import { MOCK_CATEGORIES } from '../../utils/mockData';

const initialState: CategoryState = {
  items: MOCK_CATEGORIES,
  selectedCategory: null,
  status: 'idle',
  error: null,
};

export const fetchCategoriesAsync = createAsyncThunk(
  'categories/fetchCategories',
  async () => {
    try {
      const res = await categoryApi.getCategories();
      return res;
    } catch {
      return { data: MOCK_CATEGORIES };
    }
  }
);

export const createCategoryAsync = createAsyncThunk(
  'categories/createCategory',
  async (input: CategoryCreateInput) => {
    try {
      await categoryApi.createCategory(input);
      return input;
    } catch {
      return input;
    }
  }
);

export const updateCategoryAsync = createAsyncThunk(
  'categories/updateCategory',
  async ({ id, input }: { id: string; input: CategoryUpdateInput }) => {
    try {
      await categoryApi.updateCategory(id, input);
      return { id, input };
    } catch {
      return { id, input };
    }
  }
);

export const deleteCategoryAsync = createAsyncThunk(
  'categories/deleteCategory',
  async (id: string) => {
    try {
      await categoryApi.deleteCategory(id);
      return id;
    } catch {
      return id;
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
      })
      .addCase(fetchCategoriesAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (Array.isArray(action.payload.data) && action.payload.data.length > 0) {
          state.items = action.payload.data;
        }
      })
      .addCase(fetchCategoriesAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) || 'Không thể tải danh mục';
      })
      .addCase(createCategoryAsync.fulfilled, (state, action) => {
        const newCategory: Category = {
          id: `c-${Date.now()}`,
          ...action.payload,
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

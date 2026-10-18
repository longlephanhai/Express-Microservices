import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Brand, BrandState, BrandCreateInput, BrandUpdateInput } from '../../types';
import { brandApi } from '../../api/brandApi';

const initialState: BrandState = {
  items: [],
  selectedBrand: null,
  status: 'idle',
  error: null,
};

export const fetchBrandsAsync = createAsyncThunk(
  'brands/fetchBrands',
  async (_, { rejectWithValue }) => {
    try {
      const res = await brandApi.getBrands();
      return res;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Không thể tải thương hiệu');
    }
  }
);

export const createBrandAsync = createAsyncThunk(
  'brands/createBrand',
  async (input: BrandCreateInput, { rejectWithValue }) => {
    try {
      const res = await brandApi.createBrand(input);
      const createdId = typeof res.data === 'string' ? res.data : (res.data as any)?.id || `b-${Date.now()}`;
      return { id: createdId, input };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Không thể tạo thương hiệu');
    }
  }
);

export const updateBrandAsync = createAsyncThunk(
  'brands/updateBrand',
  async ({ id, input }: { id: string; input: BrandUpdateInput }, { rejectWithValue }) => {
    try {
      await brandApi.updateBrand(id, input);
      return { id, input };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Không thể cập nhật thương hiệu');
    }
  }
);

export const deleteBrandAsync = createAsyncThunk(
  'brands/deleteBrand',
  async (id: string, { rejectWithValue }) => {
    try {
      await brandApi.deleteBrand(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Không thể xóa thương hiệu');
    }
  }
);

export const brandSlice = createSlice({
  name: 'brands',
  initialState,
  reducers: {
    setSelectedBrand: (state, action: PayloadAction<Brand | null>) => {
      state.selectedBrand = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBrandsAsync.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchBrandsAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.data || [];
      })
      .addCase(fetchBrandsAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) || 'Không thể tải thương hiệu';
      })
      .addCase(createBrandAsync.fulfilled, (state, action) => {
        const { id, input } = action.payload;
        const newBrand: Brand = {
          id,
          ...input,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        state.items.unshift(newBrand);
      })
      .addCase(updateBrandAsync.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = {
            ...state.items[index],
            ...action.payload.input,
            updatedAt: new Date().toISOString(),
          };
        }
      })
      .addCase(deleteBrandAsync.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      });
  },
});

export const { setSelectedBrand } = brandSlice.actions;
export default brandSlice.reducer;

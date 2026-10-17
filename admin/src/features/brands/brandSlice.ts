import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Brand, BrandState, BrandCreateInput, BrandUpdateInput } from '../../types';
import { brandApi } from '../../api/brandApi';
import { MOCK_BRANDS } from '../../utils/mockData';

const initialState: BrandState = {
  items: MOCK_BRANDS,
  selectedBrand: null,
  status: 'idle',
  error: null,
};

export const fetchBrandsAsync = createAsyncThunk(
  'brands/fetchBrands',
  async () => {
    try {
      const res = await brandApi.getBrands();
      return res;
    } catch {
      return { data: MOCK_BRANDS };
    }
  }
);

export const createBrandAsync = createAsyncThunk(
  'brands/createBrand',
  async (input: BrandCreateInput) => {
    try {
      await brandApi.createBrand(input);
      return input;
    } catch {
      return input;
    }
  }
);

export const updateBrandAsync = createAsyncThunk(
  'brands/updateBrand',
  async ({ id, input }: { id: string; input: BrandUpdateInput }) => {
    try {
      await brandApi.updateBrand(id, input);
      return { id, input };
    } catch {
      return { id, input };
    }
  }
);

export const deleteBrandAsync = createAsyncThunk(
  'brands/deleteBrand',
  async (id: string) => {
    try {
      await brandApi.deleteBrand(id);
      return id;
    } catch {
      return id;
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
      })
      .addCase(fetchBrandsAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (Array.isArray(action.payload.data) && action.payload.data.length > 0) {
          state.items = action.payload.data;
        }
      })
      .addCase(fetchBrandsAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) || 'Không thể tải thương hiệu';
      })
      .addCase(createBrandAsync.fulfilled, (state, action) => {
        const newBrand: Brand = {
          id: `b-${Date.now()}`,
          ...action.payload,
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

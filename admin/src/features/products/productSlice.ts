import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type {
  Product,
  ProductState,
  ProductCreateInput,
  ProductUpdateInput,
  ProductFilters,
} from '../../types';
import { productApi } from '../../api/productApi';

const initialState: ProductState = {
  items: [],
  selectedProduct: null,
  filters: {
    search: '',
    categoryId: '',
    brandId: '',
    status: '',
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

export const fetchProductsAsync = createAsyncThunk(
  'products/fetchProducts',
  async (filters: ProductFilters | undefined, { rejectWithValue }) => {
    try {
      const res = await productApi.getProducts(filters);
      return res;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Không thể tải danh sách sản phẩm');
    }
  }
);

export const createProductAsync = createAsyncThunk(
  'products/createProduct',
  async (input: ProductCreateInput, { rejectWithValue }) => {
    try {
      const res = await productApi.createProduct(input);
      const createdId = typeof res.data === 'string' ? res.data : (res.data as any)?.id || `p-${Date.now()}`;
      return { id: createdId, input };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Không thể tạo sản phẩm');
    }
  }
);

export const updateProductAsync = createAsyncThunk(
  'products/updateProduct',
  async ({ id, input }: { id: string; input: ProductUpdateInput }, { rejectWithValue }) => {
    try {
      await productApi.updateProduct(id, input);
      return { id, input };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Không thể cập nhật sản phẩm');
    }
  }
);

export const deleteProductAsync = createAsyncThunk(
  'products/deleteProduct',
  async (id: string, { rejectWithValue }) => {
    try {
      await productApi.deleteProduct(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Không thể xóa sản phẩm');
    }
  }
);

export const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<ProductFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    setSelectedProduct: (state, action: PayloadAction<Product | null>) => {
      state.selectedProduct = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProductsAsync.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProductsAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.data || [];
        state.paging.total = action.payload.paging?.total ?? (action.payload.data?.length || 0);
      })
      .addCase(fetchProductsAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) || 'Không thể tải danh sách sản phẩm';
      })
      // Create Product
      .addCase(createProductAsync.fulfilled, (state, action) => {
        const { id, input } = action.payload;
        const newProduct: Product = {
          id,
          ...input,
          rating: 5,
          saleCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        state.items.unshift(newProduct);
        state.paging.total = (state.paging.total || 0) + 1;
      })
      // Update Product
      .addCase(updateProductAsync.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = {
            ...state.items[index],
            ...action.payload.input,
            updatedAt: new Date().toISOString(),
          };
        }
      })
      // Delete Product
      .addCase(deleteProductAsync.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
        state.paging.total = Math.max(0, (state.paging.total || 1) - 1);
      });
  },
});

export const { setFilters, resetFilters, setSelectedProduct } = productSlice.actions;
export default productSlice.reducer;

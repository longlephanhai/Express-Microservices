import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Order, OrderState, OrderFilters, OrderUpdateInput } from '../../types';
import { orderApi } from '../../api/orderApi';

const initialState: OrderState = {
  items: [],
  selectedOrder: null,
  filters: {
    status: '',
    payment_status: '',
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

export const fetchOrdersAsync = createAsyncThunk(
  'orders/fetchOrders',
  async (filters: OrderFilters | undefined, { rejectWithValue }) => {
    try {
      const res = await orderApi.getOrders(filters);
      return res;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Không thể tải đơn hàng');
    }
  }
);

export const updateOrderStatusAsync = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ id, input }: { id: string; input: OrderUpdateInput }, { rejectWithValue }) => {
    try {
      await orderApi.updateOrderStatus(id, input);
      return { id, input };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Không thể cập nhật trạng thái đơn hàng');
    }
  }
);

export const deleteOrderAsync = createAsyncThunk(
  'orders/deleteOrder',
  async (id: string, { rejectWithValue }) => {
    try {
      await orderApi.deleteOrder(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Không thể xóa đơn hàng');
    }
  }
);

export const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrderFilters: (state, action: PayloadAction<Partial<OrderFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setSelectedOrder: (state, action: PayloadAction<Order | null>) => {
      state.selectedOrder = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch orders
      .addCase(fetchOrdersAsync.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchOrdersAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.data || [];
        state.paging.total = action.payload.paging?.total ?? (action.payload.data?.length || 0);
      })
      .addCase(fetchOrdersAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) || 'Không thể tải đơn hàng';
      })
      // Update order status
      .addCase(updateOrderStatusAsync.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = {
            ...state.items[index],
            ...action.payload.input,
            updated_at: new Date().toISOString(),
          };
          if (state.selectedOrder?.id === action.payload.id) {
            state.selectedOrder = {
              ...state.selectedOrder,
              ...action.payload.input,
            };
          }
        }
      })
      // Delete order
      .addCase(deleteOrderAsync.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
        if (state.selectedOrder?.id === action.payload) {
          state.selectedOrder = null;
        }
      });
  },
});

export const { setOrderFilters, setSelectedOrder } = orderSlice.actions;
export default orderSlice.reducer;

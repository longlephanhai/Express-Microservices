import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Order, OrderState, OrderFilters, OrderUpdateInput } from '../../types';
import { orderApi } from '../../api/orderApi';
import { MOCK_ORDERS } from '../../utils/mockData';

const initialState: OrderState = {
  items: MOCK_ORDERS,
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
    total: MOCK_ORDERS.length,
  },
  status: 'idle',
  error: null,
};

export const fetchOrdersAsync = createAsyncThunk(
  'orders/fetchOrders',
  async (filters: OrderFilters | undefined) => {
    try {
      const res = await orderApi.getOrders(filters);
      return res;
    } catch {
      return {
        data: MOCK_ORDERS,
        paging: { page: 1, limit: 10, total: MOCK_ORDERS.length },
      };
    }
  }
);

export const updateOrderStatusAsync = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ id, input }: { id: string; input: OrderUpdateInput }) => {
    try {
      await orderApi.updateOrderStatus(id, input);
      return { id, input };
    } catch {
      return { id, input };
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
      .addCase(fetchOrdersAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchOrdersAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (Array.isArray(action.payload.data) && action.payload.data.length > 0) {
          state.items = action.payload.data;
          state.paging.total = action.payload.paging?.total ?? action.payload.data.length;
        }
      })
      .addCase(fetchOrdersAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) || 'Không thể tải đơn hàng';
      })
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
      });
  },
});

export const { setOrderFilters, setSelectedOrder } = orderSlice.actions;
export default orderSlice.reducer;

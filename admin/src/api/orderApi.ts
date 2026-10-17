import { axiosClient } from './axiosClient';
import type { Order, OrderUpdateInput, OrderFilters, ApiResponse } from '../types';

export const orderApi = {
  getOrders: async (params?: OrderFilters): Promise<ApiResponse<Order[]>> => {
    const res = await axiosClient.get<ApiResponse<Order[]>>('/v1/orders', { params });
    return res.data;
  },

  getOrderById: async (id: string): Promise<ApiResponse<Order>> => {
    const res = await axiosClient.get<ApiResponse<Order>>(`/v1/orders/${id}`);
    return res.data;
  },

  updateOrderStatus: async (id: string, input: OrderUpdateInput): Promise<ApiResponse<boolean>> => {
    const res = await axiosClient.patch<ApiResponse<boolean>>(`/v1/orders/${id}`, input);
    return res.data;
  },

  deleteOrder: async (id: string): Promise<ApiResponse<boolean>> => {
    const res = await axiosClient.delete<ApiResponse<boolean>>(`/v1/orders/${id}`);
    return res.data;
  },
};

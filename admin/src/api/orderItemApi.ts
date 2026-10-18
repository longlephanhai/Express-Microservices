import { axiosClient } from './axiosClient';
import type { ApiResponse } from '../types';

export interface OrderItemRecord {
  id: string;
  order_id: string;
  product_id: string;
  name?: string;
  price: number;
  quantity: number;
  attribute?: string;
  image?: string;
  created_at?: string;
  updated_at?: string;
}

export const orderItemApi = {
  getOrderItems: async (orderId: string): Promise<ApiResponse<OrderItemRecord[]>> => {
    const res = await axiosClient.get<ApiResponse<OrderItemRecord[]>>(`/v1/orders/${orderId}/items`);
    return res.data;
  },


  getOrderItemById: async (id: string): Promise<ApiResponse<OrderItemRecord>> => {
    const res = await axiosClient.get<ApiResponse<OrderItemRecord>>(`/v1/order-items/${id}`);
    return res.data;
  },
};

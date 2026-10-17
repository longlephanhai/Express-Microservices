import type { LoadingStatus, Paging } from './common';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipping'
  | 'delivered'
  | 'completed'
  | 'canceled'
  | 'refunded'
  | 'deleted';

export type PaymentStatus = 'pending' | 'paid' | 'failed';
export type ShippingMethod = 'free' | 'standard';
export type PaymentMethod = 'cod' | 'zalo';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name?: string;
  price: number;
  quantity: number;
  total_amount?: number;
}

export interface Order {
  id: string;
  user_id: string;
  shipping_address: string;
  shipping_city?: string | null;
  shipping_method?: ShippingMethod | null;
  payment_method?: PaymentMethod | null;
  payment_status: PaymentStatus;
  recipient_first_name?: string | null;
  recipient_last_name?: string | null;
  recipient_phone?: string | null;
  recipient_email?: string | null;
  tracking_number?: string | null;
  status: OrderStatus;
  total_price?: number;
  items?: OrderItem[];
  created_at?: string;
  updated_at?: string;
}

export interface OrderUpdateInput {
  status?: OrderStatus;
  payment_status?: PaymentStatus;
  tracking_number?: string;
}

export interface OrderFilters {
  status?: string;
  payment_status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface OrderState {
  items: Order[];
  selectedOrder: Order | null;
  filters: OrderFilters;
  paging: Paging;
  status: LoadingStatus;
  error: string | null;
}

import { axiosClient } from './axiosClient';
import type {
  Product,
  ProductCreateInput,
  ProductUpdateInput,
  ProductFilters,
  ApiResponse,
} from '../types';

export const productApi = {
  getProducts: async (params?: ProductFilters): Promise<ApiResponse<Product[]>> => {
    const res = await axiosClient.get<ApiResponse<Product[]>>('/v1/products', { params });
    return res.data;
  },

  getProductById: async (id: string): Promise<ApiResponse<Product>> => {
    const res = await axiosClient.get<ApiResponse<Product>>(`/v1/products/${id}`);
    return res.data;
  },

  createProduct: async (input: ProductCreateInput): Promise<ApiResponse<string | Product>> => {
    const res = await axiosClient.post<ApiResponse<string | Product>>('/v1/products', input);
    return res.data;
  },

  updateProduct: async (id: string, input: ProductUpdateInput): Promise<ApiResponse<boolean>> => {
    const res = await axiosClient.patch<ApiResponse<boolean>>(`/v1/products/${id}`, input);
    return res.data;
  },

  deleteProduct: async (id: string): Promise<ApiResponse<boolean>> => {
    const res = await axiosClient.delete<ApiResponse<boolean>>(`/v1/products/${id}`);
    return res.data;
  },
};

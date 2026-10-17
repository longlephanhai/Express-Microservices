import { axiosClient } from './axiosClient';
import type { Category, CategoryCreateInput, CategoryUpdateInput, ApiResponse } from '../types';

export const categoryApi = {
  getCategories: async (params?: { page?: number; limit?: number }): Promise<ApiResponse<Category[]>> => {
    const res = await axiosClient.get<ApiResponse<Category[]>>('/v1/categories', { params });
    return res.data;
  },

  getCategoryById: async (id: string): Promise<ApiResponse<Category>> => {
    const res = await axiosClient.get<ApiResponse<Category>>(`/v1/categories/${id}`);
    return res.data;
  },

  createCategory: async (input: CategoryCreateInput): Promise<ApiResponse<string | Category>> => {
    const res = await axiosClient.post<ApiResponse<string | Category>>('/v1/categories', input);
    return res.data;
  },

  updateCategory: async (id: string, input: CategoryUpdateInput): Promise<ApiResponse<boolean>> => {
    const res = await axiosClient.patch<ApiResponse<boolean>>(`/v1/categories/${id}`, input);
    return res.data;
  },

  deleteCategory: async (id: string): Promise<ApiResponse<boolean>> => {
    const res = await axiosClient.delete<ApiResponse<boolean>>(`/v1/categories/${id}`);
    return res.data;
  },
};

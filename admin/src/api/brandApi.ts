import { axiosClient } from './axiosClient';
import type { Brand, BrandCreateInput, BrandUpdateInput, ApiResponse } from '../types';

export const brandApi = {
  getBrands: async (params?: { page?: number; limit?: number }): Promise<ApiResponse<Brand[]>> => {
    const res = await axiosClient.get<ApiResponse<Brand[]>>('/v1/brands', { params });
    return res.data;
  },

  getBrandById: async (id: string): Promise<ApiResponse<Brand>> => {
    const res = await axiosClient.get<ApiResponse<Brand>>(`/v1/brands/${id}`);
    return res.data;
  },

  createBrand: async (input: BrandCreateInput): Promise<ApiResponse<string | Brand>> => {
    const res = await axiosClient.post<ApiResponse<string | Brand>>('/v1/brands', input);
    return res.data;
  },

  updateBrand: async (id: string, input: BrandUpdateInput): Promise<ApiResponse<boolean>> => {
    const res = await axiosClient.patch<ApiResponse<boolean>>(`/v1/brands/${id}`, input);
    return res.data;
  },

  deleteBrand: async (id: string): Promise<ApiResponse<boolean>> => {
    const res = await axiosClient.delete<ApiResponse<boolean>>(`/v1/brands/${id}`);
    return res.data;
  },
};

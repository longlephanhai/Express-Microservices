import { axiosClient } from './axiosClient';
import type { UserAccount, UserFilters, ApiResponse } from '../types';

export const userApi = {
  getUsers: async (params?: UserFilters): Promise<ApiResponse<UserAccount[]>> => {
    const res = await axiosClient.get<ApiResponse<UserAccount[]>>('/v1/users', { params });
    return res.data;
  },

  getUserById: async (id: string): Promise<ApiResponse<UserAccount>> => {
    const res = await axiosClient.get<ApiResponse<UserAccount>>(`/v1/users/${id}`);
    return res.data;
  },

  updateUser: async (id: string, input: Partial<UserAccount>): Promise<ApiResponse<boolean>> => {
    const res = await axiosClient.patch<ApiResponse<boolean>>(`/v1/users/${id}`, input);
    return res.data;
  },

  deleteUser: async (id: string): Promise<ApiResponse<boolean>> => {
    const res = await axiosClient.delete<ApiResponse<boolean>>(`/v1/users/${id}`);
    return res.data;
  },
};

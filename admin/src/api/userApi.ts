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
};

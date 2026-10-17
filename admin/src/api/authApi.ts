import { axiosClient } from './axiosClient';
import type { LoginCredentials, LoginResponse, AdminUser } from '../types';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const res = await axiosClient.post<{ data: { token: string; user?: AdminUser } }>(
      '/v1/auth/login',
      credentials
    );
    // Support various response structures from user-service
    const data = res.data.data;
    const token = typeof data === 'string' ? data : data?.token || (data as unknown as string);
    const user = data?.user || {
      id: 'admin-id',
      email: credentials.email,
      role: 'admin',
    };
    return { token, user: user as AdminUser };
  },

  getProfile: async (): Promise<AdminUser> => {
    const res = await axiosClient.get<{ data: AdminUser }>('/v1/auth/me');
    return res.data.data;
  },
};

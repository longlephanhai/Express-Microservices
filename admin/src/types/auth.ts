import type { LoadingStatus } from './common';

export interface AdminUser {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  role: 'admin' | 'user' | 'superadmin';
  avatar?: string;
  createdAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginResponse {
  token: string;
  user: AdminUser;
}

export interface AuthState {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  status: LoadingStatus;
  error: string | null;
}

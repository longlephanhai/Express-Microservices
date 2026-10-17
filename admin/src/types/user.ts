import type { LoadingStatus, Paging } from './common';

export interface UserAccount {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: 'admin' | 'user' | 'manager';
  status: 'active' | 'inactive' | 'banned';
  created_at?: string;
  updated_at?: string;
}

export interface UserFilters {
  role?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface UserState {
  items: UserAccount[];
  selectedUser: UserAccount | null;
  filters: UserFilters;
  paging: Paging;
  status: LoadingStatus;
  error: string | null;
}

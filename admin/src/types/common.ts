export type LoadingStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface Paging {
  page: number;
  limit: number;
  total?: number;
}

export interface ApiResponse<T> {
  data: T;
  paging?: Paging;
  message?: string;
  error?: string;
}

export type StatusType = 'active' | 'inactive' | 'deleted';

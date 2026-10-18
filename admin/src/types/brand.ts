import type { LoadingStatus } from './common';

export interface Brand {
  id: string;
  name: string;
  tagLine?: string;
  description?: string;
  image?: string;
  logo?: string;
  status?: 'active' | 'inactive' | 'deleted';
  createdAt?: string;
  updatedAt?: string;
}

export interface BrandCreateInput {
  name: string;
  tagLine?: string;
  description?: string;
  image?: string;
  logo?: string;
  status?: 'active' | 'inactive';
}

export interface BrandUpdateInput extends Partial<BrandCreateInput> {}

export interface BrandState {
  items: Brand[];
  selectedBrand: Brand | null;
  status: LoadingStatus;
  error: string | null;
}

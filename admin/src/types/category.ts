import type { LoadingStatus } from './common';

export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string | null;
  status?: 'active' | 'inactive' | 'deleted';
  children?: Category[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryCreateInput {
  name: string;
  description?: string;
  parentId?: string | null;
  status?: 'active' | 'inactive';
}

export interface CategoryUpdateInput extends Partial<CategoryCreateInput> {}

export interface CategoryState {
  items: Category[];
  selectedCategory: Category | null;
  status: LoadingStatus;
  error: string | null;
}

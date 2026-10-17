import type { LoadingStatus, Paging } from './common';
import type { Brand } from './brand';
import type { Category } from './category';

export type ProductGender = 'male' | 'female' | 'unisex';

export interface Product {
  id: string;
  name: string;
  gender: ProductGender;
  price: number;
  salePrice: number;
  colors?: string;
  quantity: number;
  brandId?: string;
  categoryId?: string;
  content?: string;
  description?: string;
  rating?: number;
  saleCount?: number;
  status: 'active' | 'inactive' | 'deleted';
  createdAt?: string;
  updatedAt?: string;
  brand?: Brand;
  category?: Category;
}

export interface ProductCreateInput {
  name: string;
  gender: ProductGender;
  price: number;
  salePrice: number;
  colors?: string;
  quantity: number;
  brandId?: string;
  categoryId?: string;
  content?: string;
  description?: string;
  status: 'active' | 'inactive';
}

export interface ProductUpdateInput extends Partial<ProductCreateInput> {}

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  brandId?: string;
  status?: string;
  gender?: string;
  page?: number;
  limit?: number;
}

export interface ProductState {
  items: Product[];
  selectedProduct: Product | null;
  filters: ProductFilters;
  paging: Paging;
  status: LoadingStatus;
  error: string | null;
}

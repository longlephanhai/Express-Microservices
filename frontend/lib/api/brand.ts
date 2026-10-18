export type ModelStatus = 'active' | 'inactive' | 'deleted';

export interface Brand {
  id: string;
  name: string;
  image?: string;
  description?: string;
  tagLine?: string;
  status: ModelStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BrandCreateDTO {
  name: string;
  image?: string;
  description?: string;
  tagLine?: string;
}

export interface BrandUpdateDTO {
  name?: string;
  image?: string;
  description?: string;
  tagLine?: string;
}

export interface Paging {
  page: number;
  limit: number;
  total?: number;
}

export interface BrandListResponse {
  data: Brand[];
  paging: Paging;
  filter?: Record<string, unknown>;
}

export interface BrandSingleResponse {
  data: Brand;
}

export interface BrandCreateResponse {
  data: string;
}

export interface BrandActionResponse {
  data: boolean;
}

const getApiBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
  }
  return 'http://localhost:3000';
};

function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    const message = data?.message || data?.error || `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return data as T;
}

/**
 * Fetch paginated list of brands
 * GET /v1/brands?page={page}&limit={limit}
 */
export async function getBrands(page = 1, limit = 10): Promise<BrandListResponse> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/v1/brands?page=${page}&limit=${limit}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
    cache: 'no-store',
  });

  return handleResponse<BrandListResponse>(res);
}

/**
 * Fetch detail of a single brand by UUID
 * GET /v1/brands/:id
 */
export async function getBrandById(id: string): Promise<Brand> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/v1/brands/${encodeURIComponent(id)}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
    cache: 'no-store',
  });

  const response = await handleResponse<BrandSingleResponse>(res);
  return response.data;
}

/**
 * Create a new brand
 * POST /v1/brands
 */
export async function createBrand(dto: BrandCreateDTO): Promise<string> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/v1/brands`;

  const res = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(dto),
  });

  const response = await handleResponse<BrandCreateResponse>(res);
  return response.data;
}

/**
 * Update an existing brand
 * PATCH /v1/brands/:id
 */
export async function updateBrand(id: string, dto: BrandUpdateDTO): Promise<boolean> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/v1/brands/${encodeURIComponent(id)}`;

  const res = await fetch(url, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(dto),
  });

  const response = await handleResponse<BrandActionResponse>(res);
  return response.data;
}

/**
 * Soft delete a brand
 * DELETE /v1/brands/:id
 */
export async function deleteBrand(id: string): Promise<boolean> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/v1/brands/${encodeURIComponent(id)}`;

  const res = await fetch(url, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  const response = await handleResponse<BrandActionResponse>(res);
  return response.data;
}


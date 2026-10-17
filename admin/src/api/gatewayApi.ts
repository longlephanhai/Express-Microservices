import { axiosClient } from './axiosClient';

export interface HealthCheckResponse {
  service: string;
  status: 'ok' | 'degraded' | 'down';
  upstreams: {
    brand: string;
    category: string;
    product: string;
    user: string;
    cart: string;
    order: string;
  };
}

export const gatewayApi = {
  checkHealth: async (): Promise<HealthCheckResponse> => {
    const res = await axiosClient.get<HealthCheckResponse>('/health');
    return res.data;
  },
};

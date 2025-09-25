// Generated API client for VerityInspect
// Generated at: 2025-09-25T15:07:18.299Z

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ApiResponse, PaginatedResponse, ApiError } from './types';

export class VerityInspectClient {
  private client: AxiosInstance;
  
  constructor(baseURL: string = 'https://verityinspect-api.onrender.com/api', token?: string) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (token) {
      this.setAuthToken(token);
    }
    
    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        const apiError: ApiError = {
          message: error.response?.data?.message || error.message,
          code: error.response?.data?.code,
          details: error.response?.data,
        };
        return Promise.reject(apiError);
      }
    );
  }
  
  setAuthToken(token: string) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
  
  clearAuthToken() {
    delete this.client.defaults.headers.common['Authorization'];
  }

  async auth_login_create(): Promise<AxiosResponse<any>> {
    return this.client.post('/api/auth/login/');
  }

  async auth_profile_retrieve(): Promise<AxiosResponse<any>> {
    return this.client.get('/api/auth/profile/');
  }

  async auth_refresh_create(data: any): Promise<AxiosResponse<any>> {
    return this.client.post('/api/auth/refresh/', data);
  }

  async auth_users_list(params?: Record<string, any>): Promise<AxiosResponse<any>> {
    return this.client.get('/api/auth/users/', { params });
  }

  async auth_users_create(data: any): Promise<AxiosResponse<any>> {
    return this.client.post('/api/auth/users/', data);
  }

  async auth_users_retrieve(id: number): Promise<AxiosResponse<any>> {
    return this.client.get('/api/auth/users/${id}/');
  }

  async auth_users_update(id: number, data: any): Promise<AxiosResponse<any>> {
    return this.client.put('/api/auth/users/${id}/', data);
  }

  async auth_users_partial_update(id: number, data: any): Promise<AxiosResponse<any>> {
    return this.client.patch('/api/auth/users/${id}/', data);
  }

  async auth_users_destroy(id: number): Promise<AxiosResponse<any>> {
    return this.client.delete('/api/auth/users/${id}/');
  }

  async brands_list(params?: Record<string, any>): Promise<AxiosResponse<any>> {
    return this.client.get('/api/brands/', { params });
  }

  async brands_create(data: any): Promise<AxiosResponse<any>> {
    return this.client.post('/api/brands/', data);
  }

  async brands_retrieve(id: number): Promise<AxiosResponse<any>> {
    return this.client.get('/api/brands/${id}/');
  }

  async brands_update(id: number, data: any): Promise<AxiosResponse<any>> {
    return this.client.put('/api/brands/${id}/', data);
  }

  async brands_partial_update(id: number, data: any): Promise<AxiosResponse<any>> {
    return this.client.patch('/api/brands/${id}/', data);
  }

  async brands_destroy(id: number): Promise<AxiosResponse<any>> {
    return this.client.delete('/api/brands/${id}/');
  }

  async brands_stores_list(params?: Record<string, any>): Promise<AxiosResponse<any>> {
    return this.client.get('/api/brands/stores/', { params });
  }

  async brands_stores_create(data: any): Promise<AxiosResponse<any>> {
    return this.client.post('/api/brands/stores/', data);
  }

  async brands_stores_retrieve(id: number): Promise<AxiosResponse<any>> {
    return this.client.get('/api/brands/stores/${id}/');
  }

  async brands_stores_update(id: number, data: any): Promise<AxiosResponse<any>> {
    return this.client.put('/api/brands/stores/${id}/', data);
  }

  async brands_stores_partial_update(id: number, data: any): Promise<AxiosResponse<any>> {
    return this.client.patch('/api/brands/stores/${id}/', data);
  }

  async brands_stores_destroy(id: number): Promise<AxiosResponse<any>> {
    return this.client.delete('/api/brands/stores/${id}/');
  }

  async inspections_list(params?: Record<string, any>): Promise<AxiosResponse<any>> {
    return this.client.get('/api/inspections/', { params });
  }

  async inspections_findings_list(inspection_id: number, params?: Record<string, any>): Promise<AxiosResponse<any>> {
    return this.client.get('/api/inspections/${inspection_id}/findings/', { params });
  }

  async inspections_retrieve(id: number): Promise<AxiosResponse<any>> {
    return this.client.get('/api/inspections/${id}/');
  }

  async inspections_update(id: number, data: any): Promise<AxiosResponse<any>> {
    return this.client.put('/api/inspections/${id}/', data);
  }

  async inspections_partial_update(id: number, data: any): Promise<AxiosResponse<any>> {
    return this.client.patch('/api/inspections/${id}/', data);
  }

  async inspections_actions_list(params?: Record<string, any>): Promise<AxiosResponse<any>> {
    return this.client.get('/api/inspections/actions/', { params });
  }

  async inspections_actions_create(data: any): Promise<AxiosResponse<any>> {
    return this.client.post('/api/inspections/actions/', data);
  }

  async inspections_actions_retrieve(id: number): Promise<AxiosResponse<any>> {
    return this.client.get('/api/inspections/actions/${id}/');
  }

  async inspections_actions_update(id: number, data: any): Promise<AxiosResponse<any>> {
    return this.client.put('/api/inspections/actions/${id}/', data);
  }

  async inspections_actions_partial_update(id: number, data: any): Promise<AxiosResponse<any>> {
    return this.client.patch('/api/inspections/actions/${id}/', data);
  }

  async inspections_start_create(video_id: number): Promise<AxiosResponse<any>> {
    return this.client.post('/api/inspections/start/${video_id}/');
  }

  async inspections_stats_retrieve(): Promise<AxiosResponse<any>> {
    return this.client.get('/api/inspections/stats/');
  }

  async marketing_contact_create(data: any): Promise<AxiosResponse<any>> {
    return this.client.post('/api/marketing/contact/', data);
  }

  async marketing_demo_create(data: any): Promise<AxiosResponse<any>> {
    return this.client.post('/api/marketing/demo/', data);
  }

  async uploads_list(params?: Record<string, any>): Promise<AxiosResponse<any>> {
    return this.client.get('/api/uploads/', { params });
  }

  async uploads_retrieve(id: number): Promise<AxiosResponse<any>> {
    return this.client.get('/api/uploads/${id}/');
  }

  async uploads_confirm_create(upload_id: number): Promise<AxiosResponse<any>> {
    return this.client.post('/api/uploads/confirm/${upload_id}/');
  }

  async uploads_health_retrieve(): Promise<AxiosResponse<any>> {
    return this.client.get('/api/uploads/health/');
  }

  async uploads_request_presigned_url_create(): Promise<AxiosResponse<any>> {
    return this.client.post('/api/uploads/request-presigned-url/');
  }

  async uploads_retention_cleanup_create(): Promise<AxiosResponse<any>> {
    return this.client.post('/api/uploads/retention/cleanup/');
  }

  async uploads_retention_status_retrieve(): Promise<AxiosResponse<any>> {
    return this.client.get('/api/uploads/retention/status/');
  }

  async videos_list(params?: Record<string, any>): Promise<AxiosResponse<any>> {
    return this.client.get('/api/videos/', { params });
  }

  async videos_create(data: any): Promise<AxiosResponse<any>> {
    return this.client.post('/api/videos/', data);
  }

  async videos_retrieve(id: number): Promise<AxiosResponse<any>> {
    return this.client.get('/api/videos/${id}/');
  }

  async videos_update(id: number, data: any): Promise<AxiosResponse<any>> {
    return this.client.put('/api/videos/${id}/', data);
  }

  async videos_partial_update(id: number, data: any): Promise<AxiosResponse<any>> {
    return this.client.patch('/api/videos/${id}/', data);
  }

  async videos_destroy(id: number): Promise<AxiosResponse<any>> {
    return this.client.delete('/api/videos/${id}/');
  }

  async videos_reprocess_create(id: number): Promise<AxiosResponse<any>> {
    return this.client.post('/api/videos/${id}/reprocess/');
  }

  async videos_frames_list(video_id: number, params?: Record<string, any>): Promise<AxiosResponse<any>> {
    return this.client.get('/api/videos/${video_id}/frames/', { params });
  }

  async health_retrieve(): Promise<AxiosResponse<any>> {
    return this.client.get('/health/');
  }

  async live_retrieve(): Promise<AxiosResponse<any>> {
    return this.client.get('/live/');
  }

  async ready_retrieve(): Promise<AxiosResponse<any>> {
    return this.client.get('/ready/');
  }

}

export default VerityInspectClient;

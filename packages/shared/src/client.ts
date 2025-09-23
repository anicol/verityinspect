import axios, { AxiosInstance } from 'axios';
import type { 
  User, 
  Brand, 
  Store, 
  Upload, 
  Detection, 
  Rule, 
  Violation, 
  Scorecard, 
  Task, 
  AuditLog,
  LoginCredentials,
  AuthResponse,
  HealthStatus
} from './types';

export class InspectAIClient {
  private api: AxiosInstance;

  constructor(baseURL: string = 'http://localhost:8000/api') {
    this.api = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use((config) => {
      const token = this.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          const refreshToken = this.getRefreshToken();
          if (refreshToken) {
            try {
              const response = await axios.post(`${baseURL}/auth/refresh/`, {
                refresh: refreshToken,
              });
              
              const { access } = response.data;
              this.setAccessToken(access);
              
              return this.api(originalRequest);
            } catch (refreshError) {
              this.clearTokens();
              throw refreshError;
            }
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Token management
  private getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  private setAccessToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  private setRefreshToken(token: string): void {
    localStorage.setItem('refresh_token', token);
  }

  private clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.api.post('/auth/login/', credentials);
    const authData = response.data;
    this.setAccessToken(authData.access);
    this.setRefreshToken(authData.refresh);
    return authData;
  }

  async logout(): Promise<void> {
    this.clearTokens();
  }

  async getProfile(): Promise<User> {
    const response = await this.api.get('/auth/me/');
    return response.data;
  }

  // Health endpoint
  async getHealth(): Promise<HealthStatus> {
    const response = await this.api.get('/healthz/');
    return response.data;
  }

  // Upload endpoints
  async initiateUpload(data: { store_id: number; mode: 'inspection' | 'coaching' }): Promise<{
    upload_id: number;
    presigned_url: string;
    s3_key: string;
  }> {
    const response = await this.api.post('/uploads/initiate/', data);
    return response.data;
  }

  async completeUpload(data: { upload_id: number; duration_s?: number }): Promise<Upload> {
    const response = await this.api.post('/uploads/complete/', data);
    return response.data;
  }

  async getUpload(id: number): Promise<Upload> {
    const response = await this.api.get(`/uploads/${id}/`);
    return response.data;
  }

  async getUploads(params?: Record<string, any>): Promise<Upload[]> {
    const response = await this.api.get('/uploads/', { params });
    return response.data.results || response.data;
  }

  // Detection endpoints
  async getDetections(uploadId: number): Promise<Detection[]> {
    const response = await this.api.get(`/uploads/${uploadId}/detections/`);
    return response.data.results || response.data;
  }

  // Violation endpoints
  async getViolations(uploadId: number): Promise<Violation[]> {
    const response = await this.api.get(`/uploads/${uploadId}/violations/`);
    return response.data.results || response.data;
  }

  async overrideViolation(id: number, data: { status: 'dismissed' | 'approved'; notes?: string }): Promise<Violation> {
    const response = await this.api.post(`/violations/${id}/override/`, data);
    return response.data;
  }

  // Scorecard endpoints
  async getScorecard(uploadId: number): Promise<Scorecard> {
    const response = await this.api.get(`/uploads/${uploadId}/scorecard/`);
    return response.data;
  }

  // Finalize inspection
  async finalizeUpload(id: number): Promise<Upload> {
    const response = await this.api.post(`/uploads/${id}/finalize/`);
    return response.data;
  }

  // Store endpoints
  async getStores(params?: Record<string, any>): Promise<Store[]> {
    const response = await this.api.get('/stores/', { params });
    return response.data.results || response.data;
  }

  async getStore(id: number): Promise<Store> {
    const response = await this.api.get(`/stores/${id}/`);
    return response.data;
  }

  async getStoreSummary(id: number): Promise<{
    store: Store;
    recent_uploads: Upload[];
    open_tasks: Task[];
    compliance_trend: any[];
  }> {
    const response = await this.api.get(`/stores/${id}/summary/`);
    return response.data;
  }

  // Task endpoints
  async getTasks(params?: Record<string, any>): Promise<Task[]> {
    const response = await this.api.get('/tasks/', { params });
    return response.data.results || response.data;
  }

  async updateTask(id: number, data: Partial<Task>): Promise<Task> {
    const response = await this.api.patch(`/tasks/${id}/`, data);
    return response.data;
  }

  // Brand endpoints (admin only)
  async getBrands(): Promise<Brand[]> {
    const response = await this.api.get('/brands/');
    return response.data.results || response.data;
  }

  async getBrand(id: number): Promise<Brand> {
    const response = await this.api.get(`/brands/${id}/`);
    return response.data;
  }

  async updateBrandRules(id: number, rules: Rule[]): Promise<Rule[]> {
    const response = await this.api.put(`/brands/${id}/rules/`, { rules });
    return response.data;
  }

  async getBrandRules(id: number): Promise<Rule[]> {
    const response = await this.api.get(`/brands/${id}/rules/`);
    return response.data;
  }

  // Reporting endpoints
  async getBrandReport(id: number): Promise<any> {
    const response = await this.api.get(`/reports/brand/${id}/`);
    return response.data;
  }

  async getStoreReport(id: number): Promise<any> {
    const response = await this.api.get(`/reports/store/${id}/`);
    return response.data;
  }
}

// Export singleton instance
export const apiClient = new InspectAIClient();
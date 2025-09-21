import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { API_URL, CONFIG, isDevelopment } from '../constants';

// Type definitions for API service
export interface ApiErrorResponse {
  message: string;
  statusCode?: number;
  error?: string;
}

export interface ApiRequestConfig extends AxiosRequestConfig {
  skipAuth?: boolean;
  timeout?: number;
}

export interface CompanyAwareData {
  company: string;
  [key: string]: unknown;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success?: boolean;
}

// Auth token management interface
export interface AuthTokenManager {
  setToken(token: string): void;
  getToken(): string | null;
  clearToken(): void;
  hasToken(): boolean;
}

// Create axios instance with base configuration
const createApiInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_URL,
    timeout: 10000, // 10 seconds timeout
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor with improved typing
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Add auth token if available
      const token = localStorage.getItem('accessToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Log requests in development
      if (isDevelopment) {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data);
      }

      return config;
    },
    (error: AxiosError) => {
      if (isDevelopment) {
        console.error('API Request Error:', error);
      }
      return Promise.reject(error);
    }
  );

  // Response interceptor with improved error handling
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      // Log responses in development
      if (isDevelopment) {
        console.log(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
      }
      return response;
    },
    (error: AxiosError<ApiErrorResponse>) => {
      // Handle common error cases
      if (error.response?.status === 401) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('accessToken');
        // You might want to redirect to login page here
        window.location.href = '/login';
      }

      if (isDevelopment) {
        console.error('API Response Error:', error.response?.data || error.message);
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

// Create the main API instance
export const apiClient = createApiInstance();

// API service class with improved TypeScript support
export class ApiService implements AuthTokenManager {
  private static instance: ApiService;
  private readonly api: AxiosInstance;

  private constructor() {
    this.api = apiClient;
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  // Generic HTTP methods with improved type safety
  public async get<T = unknown>(url: string, config?: ApiRequestConfig): Promise<T> {
    try {
      const response = await this.api.get<T>(url, config);
      return response.data;
    } catch (error) {
      throw this.handleApiError(error as AxiosError<ApiErrorResponse>);
    }
  }

  public async post<T = unknown, D = unknown>(url: string, data?: D, config?: ApiRequestConfig): Promise<T> {
    try {
      const response = await this.api.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleApiError(error as AxiosError<ApiErrorResponse>);
    }
  }

  public async put<T = unknown, D = unknown>(url: string, data?: D, config?: ApiRequestConfig): Promise<T> {
    try {
      const response = await this.api.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleApiError(error as AxiosError<ApiErrorResponse>);
    }
  }

  public async patch<T = unknown, D = unknown>(url: string, data?: D, config?: ApiRequestConfig): Promise<T> {
    try {
      const response = await this.api.patch<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleApiError(error as AxiosError<ApiErrorResponse>);
    }
  }

  public async delete<T = unknown>(url: string, config?: ApiRequestConfig): Promise<T> {
    try {
      const response = await this.api.delete<T>(url, config);
      return response.data;
    } catch (error) {
      throw this.handleApiError(error as AxiosError<ApiErrorResponse>);
    }
  }

  // Authentication methods implementing AuthTokenManager interface
  public setToken(token: string): void {
    if (!token || typeof token !== 'string') {
      throw new Error('Invalid token provided');
    }
    localStorage.setItem('accessToken', token);
    this.api.defaults.headers.Authorization = `Bearer ${token}`;
  }

  public clearToken(): void {
    localStorage.removeItem('accessToken');
    delete this.api.defaults.headers.Authorization;
  }

  public getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  public hasToken(): boolean {
    return this.getToken() !== null;
  }

  // Legacy method aliases for backward compatibility
  public setAuthToken(token: string): void {
    this.setToken(token);
  }

  public clearAuthToken(): void {
    this.clearToken();
  }

  public getAuthToken(): string | null {
    return this.getToken();
  }

  // Company-specific methods with improved typing
  public async getWithCompany<T = unknown>(url: string, companyId: string, config?: ApiRequestConfig): Promise<T> {
    if (!companyId || typeof companyId !== 'string') {
      throw new Error('Valid company ID is required');
    }
    const params = { company: companyId, ...config?.params };
    return this.get<T>(url, { ...config, params });
  }

  public async postWithCompany<T = unknown, D = Record<string, unknown>>(
    url: string,
    data: D,
    companyId: string,
    config?: ApiRequestConfig
  ): Promise<T> {
    if (!companyId || typeof companyId !== 'string') {
      throw new Error('Valid company ID is required');
    }
    const payload: CompanyAwareData = { ...data as Record<string, unknown>, company: companyId };
    return this.post<T>(url, payload, config);
  }

  public async putWithCompany<T = unknown, D = Record<string, unknown>>(
    url: string,
    data: D,
    companyId: string,
    config?: ApiRequestConfig
  ): Promise<T> {
    if (!companyId || typeof companyId !== 'string') {
      throw new Error('Valid company ID is required');
    }
    const payload: CompanyAwareData = { ...data as Record<string, unknown>, company: companyId };
    return this.put<T>(url, payload, config);
  }

  // Development types endpoint (used by generatetypes.js)
  public async getDevelopmentTypes(): Promise<Record<string, unknown>> {
    return this.get<Record<string, unknown>>('/api/development/types');
  }

  // Error handling helper
  private handleApiError(error: AxiosError<ApiErrorResponse>): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    if (error.response?.statusText) {
      return new Error(error.response.statusText);
    }
    return new Error(error.message || 'An unknown API error occurred');
  }

  // Request helpers
  public async request<T = unknown>(
    method: HttpMethod,
    url: string,
    data?: unknown,
    config?: ApiRequestConfig
  ): Promise<T> {
    switch (method.toLowerCase()) {
      case 'get':
        return this.get<T>(url, config);
      case 'post':
        return this.post<T>(url, data, config);
      case 'put':
        return this.put<T>(url, data, config);
      case 'patch':
        return this.patch<T>(url, data, config);
      case 'delete':
        return this.delete<T>(url, config);
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }
  }
}

// Export singleton instance
export const apiService = ApiService.getInstance();

// Export the configuration for external use
export { CONFIG as API_CONFIG };

// Helper functions for common API patterns with improved type safety
export const createApiUrl = (endpoint: string): string => {
  if (!endpoint || typeof endpoint !== 'string') {
    throw new Error('Valid endpoint is required');
  }
  return `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

export const isApiError = (error: unknown): error is AxiosError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as AxiosError).response?.status === 'number'
  );
};

export const getApiErrorMessage = (error: unknown): string => {
  if (isApiError(error)) {
    const apiError = error as AxiosError<ApiErrorResponse>;
    if (apiError.response?.data?.message) {
      return apiError.response.data.message;
    }
    if (apiError.response?.statusText) {
      return apiError.response.statusText;
    }
    if (apiError.message) {
      return apiError.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unknown error occurred';
};

// Additional utility functions
export const isSuccessResponse = <T>(response: AxiosResponse<T>): boolean => {
  return response.status >= 200 && response.status < 300;
};

export const extractResponseData = <T>(response: AxiosResponse<ApiResponse<T>>): T => {
  return response.data.data;
};

// Type guards for API responses
export const isApiResponse = <T>(response: unknown): response is ApiResponse<T> => {
  return (
    typeof response === 'object' &&
    response !== null &&
    'data' in response
  );
};

export const hasApiError = (response: unknown): response is { error: string } => {
  return (
    typeof response === 'object' &&
    response !== null &&
    'error' in response &&
    typeof (response as { error: string }).error === 'string'
  );
};
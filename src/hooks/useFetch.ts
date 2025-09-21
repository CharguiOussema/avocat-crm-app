import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from 'react-query';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_URL } from '../constants';
import { LoginBodyType, UserLoginResponseType } from '../models/user';

// Generic fetch function
const fetchData = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  const response: AxiosResponse<T> = await axios.get(`${API_URL}${url}`, config);
  return response.data;
};

// Generic post function
const postData = async <T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> => {
  const response: AxiosResponse<T> = await axios.post(`${API_URL}${url}`, data, config);
  return response.data;
};

// Generic put function
const putData = async <T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> => {
  const response: AxiosResponse<T> = await axios.put(`${API_URL}${url}`, data, config);
  return response.data;
};

// Generic delete function
const deleteData = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  const response: AxiosResponse<T> = await axios.delete(`${API_URL}${url}`, config);
  return response.data;
};

// Hook for GET requests
export const useFetch = <T>(
  queryKey: (string | number | boolean)[],
  url: string,
  options?: Omit<UseQueryOptions<T, Error>, 'queryKey' | 'queryFn'> & {
    config?: AxiosRequestConfig;
  }
) => {
  const { config, ...queryOptions } = options || {};

  return useQuery<T, Error>({
    queryKey,
    queryFn: () => fetchData<T>(url, config),
    ...queryOptions,
  });
};

// Hook for POST requests
export const usePost = <T, D = unknown>(
  options?: UseMutationOptions<T, Error, { url: string; data?: D; config?: AxiosRequestConfig }>
) => {
  const queryClient = useQueryClient();

  return useMutation<T, Error, { url: string; data?: D; config?: AxiosRequestConfig }>({
    mutationFn: ({ url, data, config }) => postData<T, D>(url, data, config),
    onSuccess: () => {
      // Invalidate and refetch queries after successful mutation
      queryClient.invalidateQueries();
    },
    ...options,
  });
};

// Hook for PUT requests
export const usePut = <T, D = unknown>(
  options?: UseMutationOptions<T, Error, { url: string; data?: D; config?: AxiosRequestConfig }>
) => {
  const queryClient = useQueryClient();

  return useMutation<T, Error, { url: string; data?: D; config?: AxiosRequestConfig }>({
    mutationFn: ({ url, data, config }) => putData<T, D>(url, data, config),
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
    ...options,
  });
};

// Hook for DELETE requests
export const useDelete = <T>(
  options?: UseMutationOptions<T, Error, { url: string; config?: AxiosRequestConfig }>
) => {
  const queryClient = useQueryClient();

  return useMutation<T, Error, { url: string; config?: AxiosRequestConfig }>({
    mutationFn: ({ url, config }) => deleteData<T>(url, config),
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
    ...options,
  });
};

// Feature-specific hooks examples

// Clients
export const useClients = (params?: Record<string, string>) => {
  const queryParams = params ? `?${new URLSearchParams(params).toString()}` : '';
  return useFetch(['clients', ...(params ? [JSON.stringify(params)] : [])], `/api/clients${queryParams}`);
};

export const useClient = (id: string) => {
  return useFetch(['client', id], `/api/clients/${id}`, {
    enabled: !!id,
  });
};

export const useCreateClient = () => {
  return usePost({
    onSuccess: () => {
      // You can add specific logic here if needed
    },
  });
};

export const useUpdateClient = () => {
  return usePut({
    onSuccess: () => {
      // You can add specific logic here if needed
    },
  });
};

export const useDeleteClient = () => {
  return useDelete({
    onSuccess: () => {
      // You can add specific logic here if needed
    },
  });
};

// Cases
export const useCases = (params?: Record<string, string>) => {
  const queryParams = params ? `?${new URLSearchParams(params).toString()}` : '';
  return useFetch(['cases', ...(params ? [JSON.stringify(params)] : [])], `/api/cases${queryParams}`);
};

export const useCase = (id: string) => {
  return useFetch(['case', id], `/api/cases/${id}`, {
    enabled: !!id,
  });
};

export const useCreateCase = () => {
  return usePost();
};

export const useUpdateCase = () => {
  return usePut();
};

export const useDeleteCase = () => {
  return useDelete();
};

// Documents
export const useDocuments = (params?: Record<string, string>) => {
  const queryParams = params ? `?${new URLSearchParams(params).toString()}` : '';
  return useFetch(['documents', ...(params ? [JSON.stringify(params)] : [])], `/api/documents${queryParams}`);
};

export const useDocument = (id: string) => {
  return useFetch(['document', id], `/api/documents/${id}`, {
    enabled: !!id,
  });
};

export const useCreateDocument = () => {
  return usePost();
};

export const useUpdateDocument = () => {
  return usePut();
};

export const useDeleteDocument = () => {
  return useDelete();
};

// Authentication
export const useLogin = () => {
  return usePost<UserLoginResponseType, LoginBodyType>({
    onSuccess: () => {
      // Login successful - Auth context will handle token setting
    },
  });
};
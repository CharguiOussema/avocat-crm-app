import { useState, useEffect, useCallback } from 'react';
import { apiService, getApiErrorMessage } from '../services/api';

// Generic API hook for basic REST operations
export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface UseApiActions {
  refetch: () => Promise<void>;
  clearError: () => void;
}

export type UseApiResult<T> = UseApiState<T> & UseApiActions;

// Hook for GET requests
export function useApiGet<T = any>(url: string, immediate: boolean = true): UseApiResult<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const data = await apiService.get<T>(url);
      setState(prev => ({ ...prev, data, loading: false }));
    } catch (error) {
      const errorMessage = getApiErrorMessage(error);
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
    }
  }, [url]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [fetchData, immediate]);

  return {
    ...state,
    refetch: fetchData,
    clearError,
  };
}

// Hook for POST/PUT/PATCH/DELETE operations
export interface UseMutationState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface UseMutationActions<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData>;
  reset: () => void;
}

export type UseMutationResult<TData, TVariables> = UseMutationState<TData> & UseMutationActions<TData, TVariables>;

export function useApiMutation<TData = any, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<TData>
): UseMutationResult<TData, TVariables> {
  const [state, setState] = useState<UseMutationState<TData>>({
    data: null,
    loading: false,
    error: null,
  });

  const mutate = useCallback(async (variables: TVariables): Promise<TData> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const data = await mutationFn(variables);
      setState(prev => ({ ...prev, data, loading: false }));
      return data;
    } catch (error) {
      const errorMessage = getApiErrorMessage(error);
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      throw error;
    }
  }, [mutationFn]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    mutate,
    reset,
  };
}

// Specific hooks for common CRM operations

// Clients API hooks
export const useClients = (companyId: string) => {
  return useApiGet(`/api/clients?company=${companyId}`);
};

export const useClient = (clientId: string, companyId: string) => {
  return useApiGet(`/api/clients/${clientId}?company=${companyId}`);
};

export const useCreateClient = () => {
  return useApiMutation((clientData: any) =>
    apiService.post('/api/clients', clientData)
  );
};

export const useUpdateClient = () => {
  return useApiMutation(({ id, ...clientData }: any) =>
    apiService.put(`/api/clients/${id}`, clientData)
  );
};

export const useDeleteClient = () => {
  return useApiMutation((clientId: string) =>
    apiService.delete(`/api/clients/${clientId}`)
  );
};

// Cases API hooks
export const useCases = (companyId: string) => {
  return useApiGet(`/api/cases?company=${companyId}`);
};

export const useCase = (caseId: string, companyId: string) => {
  return useApiGet(`/api/cases/${caseId}?company=${companyId}`);
};

export const useCreateCase = () => {
  return useApiMutation((caseData: any) =>
    apiService.post('/api/cases', caseData)
  );
};

export const useUpdateCase = () => {
  return useApiMutation(({ id, ...caseData }: any) =>
    apiService.put(`/api/cases/${id}`, caseData)
  );
};

export const useDeleteCase = () => {
  return useApiMutation((caseId: string) =>
    apiService.delete(`/api/cases/${caseId}`)
  );
};

// Documents API hooks
export const useDocuments = (companyId: string) => {
  return useApiGet(`/api/documents?company=${companyId}`);
};

export const useDocument = (documentId: string, companyId: string) => {
  return useApiGet(`/api/documents/${documentId}?company=${companyId}`);
};

export const useCreateDocument = () => {
  return useApiMutation((documentData: any) =>
    apiService.post('/api/documents', documentData)
  );
};

export const useUpdateDocument = () => {
  return useApiMutation(({ id, ...documentData }: any) =>
    apiService.put(`/api/documents/${id}`, documentData)
  );
};

export const useDeleteDocument = () => {
  return useApiMutation((documentId: string) =>
    apiService.delete(`/api/documents/${documentId}`)
  );
};
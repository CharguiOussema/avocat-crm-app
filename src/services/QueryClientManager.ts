import { QueryClient } from 'react-query';

// Query keys for consistent cache management
export const queryKeys = {
  // User-related queries
  USERS: 'users',
  USER_DETAILS: 'user-details',
  CURRENT_USER: 'currentUser',

  // Client-related queries
  CLIENTS: 'clients',
  CLIENT_DETAILS: 'client-details',

  // Company-related queries
  COMPANIES: 'companies',
  COMPANY_DETAILS: 'company-details',
  CURRENT_COMPANY: 'currentCompany',

  // Court-related queries
  COURTS: 'courts',
  COURT_DETAILS: 'court-details',

  // Lawsuit-related queries
  LAWSUITS: 'lawsuits',
  LAWSUIT_DETAILS: 'lawsuit-details',

  // Lawsuit Stage-related queries
  LAWSUIT_STAGES: 'lawsuitStages',
  LAWSUIT_STAGE_DETAILS: 'lawsuitStage-details',

  // Type Lawsuit-related queries
  TYPE_LAWSUITS: 'typeLawsuits',
  TYPE_LAWSUIT_DETAILS: 'typeLawsuit-details',

  // Event-related queries
  EVENTS: 'events',
  EVENT_DETAILS: 'event-details',

  // Folder-related queries
  FOLDERS: 'folders',
  FOLDER_DETAILS: 'folder-details',
  FOLDER_TREE: 'folder-tree',

  // File-related queries
  FILES: 'files',
  FILE_DETAILS: 'file-details',

  // Filter queries
  FILTERS: 'filters',
} as const;

// Query client manager for centralized query management
class QueryClientManager {
  private static instance: QueryClientManager;
  private queryClient: QueryClient;

  private constructor() {
    this.queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60 * 5, // 5 minutes
          refetchOnWindowFocus: false,
          retry: 1,
        },
        mutations: {
          retry: 1,
        },
      },
    });
  }

  public static getInstance(): QueryClientManager {
    if (!QueryClientManager.instance) {
      QueryClientManager.instance = new QueryClientManager();
    }
    return QueryClientManager.instance;
  }

  public getQueryClient(): QueryClient {
    return this.queryClient;
  }

  // Helper method to invalidate queries by key
  public invalidateQueries(queryKey: string | string[]): Promise<void> {
    return this.queryClient.invalidateQueries(queryKey);
  }

  // Helper method to refetch queries by key
  public refetchQueries(queryKey: string | string[]): Promise<void> {
    return this.queryClient.refetchQueries(queryKey);
  }

  // Helper method to remove queries by key
  public removeQueries(queryKey: string | string[]): void {
    this.queryClient.removeQueries(queryKey);
  }

  // Helper method to clear all cache
  public clear(): void {
    this.queryClient.clear();
  }
}

export const queryClientManager = QueryClientManager.getInstance();
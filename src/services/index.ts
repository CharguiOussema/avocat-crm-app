// Export all services from a single entry point
export * from './api';

// Export individual services
export { userService } from './UserService';
export { clientService } from './ClientService';
export { companyService } from './CompanyService';
export { lawsuitService } from './LawsuitService';
export { fileService } from './FileService';

// Export file service types
export type { FileModel, FileUploadData, FileQueryParams, StorageConfig } from './FileService';

// Export utility classes
export { QueryBuilder } from './QueryBuilder';
export { queryClientManager, queryKeys } from './QueryClientManager';
export { baseHttpClient } from './abstract/BaseHttpClient';

// Re-export commonly used items for convenience
export { apiService as api } from './api';
export { API_URL, CRM_URL, CONFIG } from '../constants';
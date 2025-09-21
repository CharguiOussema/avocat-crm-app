// Export all services from a single entry point
export * from './api';

// Re-export commonly used items for convenience
export { apiService as api } from './api';
export { API_URL, CRM_URL, CONFIG } from '../constants';
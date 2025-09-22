// Export all hooks from a single entry point
export * from './useAuth';
export * from './useApp';

// Export generic hooks
export { useFetch, usePost, usePut, useDelete, useLogin } from './useFetch';

// Export custom fetch hooks
export { useFetchClients } from './useFetchClients';
export { useFetchUsers } from './useFetchUsers';
export { useFetchLawsuits } from './useFetchLawsuits';

// Export utility hooks
export { default as useQueryParams } from './useQueryParams';

// You can add more hooks here as they are created
// export * from './useAuth';
// export * from './useLocalStorage';
// export * from './useDebounce';
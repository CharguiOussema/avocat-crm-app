// Export all hooks from a single entry point
export * from './useAuth';
export * from './useApp';

// Export generic hooks
export { useFetch, usePost, usePut, useDelete, useLogin } from './useFetch';

// Export custom fetch hooks
export { useFetchClients } from './useFetchClients';
export { useInfiniteClients } from './useInfiniteClients';
export { useFetchUsers } from './useFetchUsers';
export { useInfiniteUsers } from './useInfiniteUsers';
export { useFetchLawsuits } from './useFetchLawsuits';
export { useInfiniteLawsuits } from './useInfiniteLawsuits';
export { useFetchEvents } from './useFetchEvents';
export { useInfiniteEvents } from './useInfiniteEvents';
export { useInfiniteCourts } from './useInfiniteCourts';

// Export utility hooks
export { default as useQueryParams } from './useQueryParams';

// You can add more hooks here as they are created
// export * from './useAuth';
// export * from './useLocalStorage';
// export * from './useDebounce';
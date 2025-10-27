/**
 * Pagination hook for Ant Design tables
 * Provides consistent pagination state management across the application
 */

import { useState, useCallback } from "react";
import type { TablePaginationConfig } from "antd/es/table";

export interface PaginationState {
  current: number;
  pageSize: number;
}

export interface UsePaginationReturn {
  pagination: PaginationState;
  handleTableChange: (newPagination: TablePaginationConfig) => void;
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;
  resetPagination: () => void;
}

/**
 * Hook for managing table pagination
 * @param initialPage - Initial page number (default: 1)
 * @param initialPageSize - Initial page size (default: 10)
 * @returns Pagination state and handlers
 */
export const usePagination = (
  initialPage: number = 1,
  initialPageSize: number = 10
): UsePaginationReturn => {
  const [pagination, setPagination] = useState<PaginationState>({
    current: initialPage,
    pageSize: initialPageSize,
  });

  const handleTableChange = useCallback(
    (newPagination: TablePaginationConfig) => {
      setPagination({
        current: newPagination.current ?? 1,
        pageSize: newPagination.pageSize ?? 10,
      });
    },
    []
  );

  const resetPagination = useCallback(() => {
    setPagination({
      current: initialPage,
      pageSize: initialPageSize,
    });
  }, [initialPage, initialPageSize]);

  return {
    pagination,
    handleTableChange,
    setPagination,
    resetPagination,
  };
};

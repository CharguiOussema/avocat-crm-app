import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { QueryBuilder } from '../services/QueryBuilder';
import { queryKeys } from '../services/QueryClientManager';
import { userService } from '../services/UserService';
import useQueryParams from './useQueryParams';

interface IPaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  roles?: string;
}

export function useFetchUsers() {
  const { limit = 10, page = 1, search = '', roles = '' } = useQueryParams<IPaginationParams>();
  const navigate = useNavigate();

  const response = useQuery(
    [
      queryKeys.USERS,
      {
        page: page,
        limit: limit,
        search,
        roles,
      },
    ] as const,
    ({ queryKey }) => {
      const [, { page, limit, search, roles }] = queryKey;
      const filter: { search?: string; roles?: string } = {};
      if (search && search.length !== 0) {
        filter.search = search;
      }
      if (roles && roles.length !== 0) {
        filter.roles = roles;
      }

      return userService.getAll({ page, limit, ...filter });
    },
    { keepPreviousData: true }
  );

  const handleTableChange = (
    pagination: { pageSize: number; current: number }
  ) => {
    const searchParams = QueryBuilder.generateSearchParams()
      .setLimit(pagination.pageSize)
      .setPage(pagination.current).search;
    navigate({
      search: searchParams,
    });
  };

  return {
    response,
    handleTableChange,
  };
}
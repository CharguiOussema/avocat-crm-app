/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 11/26/2025
 */

import { useInfiniteQuery } from "react-query";
import { queryKeys } from "../services/QueryClientManager";
import { userService } from "../services/UserService";
import { PaginationResponse } from "../models/ResponseType";
import { UserItemResponseType } from "../models/user";

interface UseInfiniteUsersParams {
	search?: string;
	roles?: string;
	limit?: number;
}

export function useInfiniteUsers(params: UseInfiniteUsersParams = {}) {
	const { search = "", roles = "", limit = 20 } = params;

	return useInfiniteQuery(
		[queryKeys.USERS, { search, roles, limit }] as const,
		async ({ pageParam = 1 }) => {
			const filter: { search?: string; roles?: string } = {};
			if (search && search.length !== 0) {
				filter.search = search;
			}
			if (roles && roles.length !== 0) {
				filter.roles = roles;
			}

			const response = await userService.getAll({
				page: pageParam,
				limit,
				...filter,
			});

			return response.data;
		},
		{
			getNextPageParam: (lastPage: PaginationResponse<UserItemResponseType>) => {
				return lastPage.hasNextPage ? lastPage.nextPage : undefined;
			},
			getPreviousPageParam: (firstPage: PaginationResponse<UserItemResponseType>) => {
				return firstPage.hasPrevPage ? firstPage.prevPage : undefined;
			},
			keepPreviousData: true,
			staleTime: 5 * 60 * 1000, // 5 minutes
		}
	);
}

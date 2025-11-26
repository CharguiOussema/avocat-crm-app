/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 11/25/2025
 */

import { useInfiniteQuery } from "react-query";
import { queryKeys } from "../services/QueryClientManager";
import { clientService } from "../services/ClientService";
import { PaginationResponse } from "../models/ResponseType";
import { ClientItemResponseType } from "../models/client";

interface UseInfiniteClientsParams {
	search?: string;
	limit?: number;
}

export function useInfiniteClients(params: UseInfiniteClientsParams = {}) {
	const { search = "", limit = 20 } = params;

	return useInfiniteQuery(
		[queryKeys.CLIENTS, { search, limit }] as const,
		async ({ pageParam = 1 }) => {
			const filter: { search?: string } = {};
			if (search && search.length !== 0) {
				filter.search = search;
			}

			const response = await clientService.getAll({
				page: pageParam,
				limit,
				...filter,
			});

			return response.data;
		},
		{
			getNextPageParam: (lastPage: PaginationResponse<ClientItemResponseType>) => {
				return lastPage.hasNextPage ? lastPage.nextPage : undefined;
			},
			getPreviousPageParam: (firstPage: PaginationResponse<ClientItemResponseType>) => {
				return firstPage.hasPrevPage ? firstPage.prevPage : undefined;
			},
			keepPreviousData: true,
			staleTime: 5 * 60 * 1000, // 5 minutes
		}
	);
}

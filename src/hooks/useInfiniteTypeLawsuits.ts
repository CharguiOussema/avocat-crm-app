/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 11/27/2025
 */

import { useInfiniteQuery } from "react-query";
import { queryKeys } from "../services/QueryClientManager";
import { typeLawsuitService } from "../services/TypeLawsuitService";
import { PaginationResponse } from "../models/ResponseType";
import { TypeLawsuitModelType } from "../models/typeLawsuit";

interface UseInfiniteTypeLawsuitsParams {
	search?: string;
	limit?: number;
}

export function useInfiniteTypeLawsuits(params: UseInfiniteTypeLawsuitsParams = {}) {
	const { search = "", limit = 20 } = params;

	return useInfiniteQuery(
		[queryKeys.TYPE_LAWSUITS, { search, limit }] as const,
		async ({ pageParam = 1 }) => {
			const filter: { search?: string } = {};

			if (search && search.length !== 0) {
				filter.search = search;
			}

			const response = await typeLawsuitService.getAll({
				page: pageParam,
				limit,
				...filter,
			});

			return response.data;
		},
		{
			getNextPageParam: (lastPage: PaginationResponse<TypeLawsuitModelType>) => {
				return lastPage.hasNextPage ? lastPage.nextPage : undefined;
			},
			getPreviousPageParam: (firstPage: PaginationResponse<TypeLawsuitModelType>) => {
				return firstPage.hasPrevPage ? firstPage.prevPage : undefined;
			},
			keepPreviousData: true,
			staleTime: 5 * 60 * 1000, // 5 minutes
		}
	);
}

/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 11/26/2025
 */

import { useInfiniteQuery } from "react-query";
import { queryKeys } from "../services/QueryClientManager";
import { courtService } from "../services/CourtService";
import { PaginationResponse } from "../models/ResponseType";
import { CourtModelType } from "../models/court";

interface UseInfiniteCourtsParams {
	search?: string;
	limit?: number;
}

export function useInfiniteCourts(params: UseInfiniteCourtsParams = {}) {
	const { search = "", limit = 20 } = params;

	return useInfiniteQuery(
		[queryKeys.COURTS, { search, limit }] as const,
		async ({ pageParam = 1 }) => {
			const filter: { search?: string } = {};

			if (search && search.length !== 0) {
				filter.search = search;
			}

			const response = await courtService.getAll({
				page: pageParam,
				limit,
				...filter,
			});

			return response.data;
		},
		{
			getNextPageParam: (lastPage: PaginationResponse<CourtModelType>) => {
				return lastPage.hasNextPage ? lastPage.nextPage : undefined;
			},
			getPreviousPageParam: (firstPage: PaginationResponse<CourtModelType>) => {
				return firstPage.hasPrevPage ? firstPage.prevPage : undefined;
			},
			keepPreviousData: true,
			staleTime: 5 * 60 * 1000, // 5 minutes
		}
	);
}

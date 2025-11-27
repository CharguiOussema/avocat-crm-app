/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 11/27/2025
 */

import { useInfiniteQuery } from "react-query";
import { queryKeys } from "../services/QueryClientManager";
import { lawsuitStageService } from "../services/LawsuitStageService";
import { PaginationResponse } from "../models/ResponseType";
import { LawsuitStageModelType } from "../models/lawsuitStage";

interface UseInfiniteLawsuitStagesParams {
	search?: string;
	limit?: number;
}

export function useInfiniteLawsuitStages(params: UseInfiniteLawsuitStagesParams = {}) {
	const { search = "", limit = 20 } = params;

	return useInfiniteQuery(
		[queryKeys.LAWSUIT_STAGES, { search, limit }] as const,
		async ({ pageParam = 1 }) => {
			const filter: { search?: string } = {};

			if (search && search.length !== 0) {
				filter.search = search;
			}

			const response = await lawsuitStageService.getAll({
				page: pageParam,
				limit,
				...filter,
			});

			return response.data;
		},
		{
			getNextPageParam: (lastPage: PaginationResponse<LawsuitStageModelType>) => {
				return lastPage.hasNextPage ? lastPage.nextPage : undefined;
			},
			getPreviousPageParam: (firstPage: PaginationResponse<LawsuitStageModelType>) => {
				return firstPage.hasPrevPage ? firstPage.prevPage : undefined;
			},
			keepPreviousData: true,
			staleTime: 5 * 60 * 1000, // 5 minutes
		}
	);
}

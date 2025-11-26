/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 11/26/2025
 */

import { useInfiniteQuery } from "react-query";
import { queryKeys } from "../services/QueryClientManager";
import { lawsuitService } from "../services/LawsuitService";
import { PaginationResponse } from "../models/ResponseType";
import { LawsuitItemResponseType } from "../models/lawsuit";

interface UseInfiniteLawsuitsParams {
	search?: string;
	status?: string;
	client?: string;
	court?: string;
	lawsuitStage?: string;
	lawsuitType?: string;
	limit?: number;
}

export function useInfiniteLawsuits(params: UseInfiniteLawsuitsParams = {}) {
	const {
		search = "",
		status = "",
		client = "",
		court = "",
		lawsuitStage = "",
		lawsuitType = "",
		limit = 20,
	} = params;

	return useInfiniteQuery(
		[
			queryKeys.LAWSUITS,
			{ search, status, client, court, lawsuitStage, lawsuitType, limit },
		] as const,
		async ({ pageParam = 1 }) => {
			const filter: {
				search?: string;
				status?: string;
				client?: string;
				court?: string;
				lawsuitStage?: string;
				lawsuitType?: string;
			} = {};

			if (search && search.length !== 0) {
				filter.search = search;
			}
			if (status && status.length !== 0) {
				filter.status = status;
			}
			if (client && client.length !== 0) {
				filter.client = client;
			}
			if (court && court.length !== 0) {
				filter.court = court;
			}
			if (lawsuitStage && lawsuitStage.length !== 0) {
				filter.lawsuitStage = lawsuitStage;
			}
			if (lawsuitType && lawsuitType.length !== 0) {
				filter.lawsuitType = lawsuitType;
			}

			const response = await lawsuitService.getAll({
				page: pageParam,
				limit,
				...filter,
			});

			return response.data;
		},
		{
			getNextPageParam: (lastPage: PaginationResponse<LawsuitItemResponseType>) => {
				return lastPage.hasNextPage ? lastPage.nextPage : undefined;
			},
			getPreviousPageParam: (firstPage: PaginationResponse<LawsuitItemResponseType>) => {
				return firstPage.hasPrevPage ? firstPage.prevPage : undefined;
			},
			keepPreviousData: true,
			staleTime: 5 * 60 * 1000, // 5 minutes
		}
	);
}

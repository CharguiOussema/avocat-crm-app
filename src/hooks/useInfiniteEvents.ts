/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 11/26/2025
 */

import { useInfiniteQuery } from "react-query";
import { queryKeys } from "../services/QueryClientManager";
import { eventService } from "../services/EventService";
import { PaginationResponse } from "../models/ResponseType";
import { EventItemResponseType } from "../models/event";

interface UseInfiniteEventsParams {
	search?: string;
	client?: string;
	lawsuit?: string;
	limit?: number;
}

export function useInfiniteEvents(params: UseInfiniteEventsParams = {}) {
	const { search = "", client = "", lawsuit = "", limit = 20 } = params;

	return useInfiniteQuery(
		[queryKeys.EVENTS, { search, client, lawsuit, limit }] as const,
		async ({ pageParam = 1 }) => {
			const filter: {
				search?: string;
				client?: string;
				lawsuit?: string;
			} = {};

			if (search && search.length !== 0) {
				filter.search = search;
			}
			if (client && client.length !== 0) {
				filter.client = client;
			}
			if (lawsuit && lawsuit.length !== 0) {
				filter.lawsuit = lawsuit;
			}

			const response = await eventService.getAll({
				page: pageParam,
				limit,
				...filter,
			});

			return response.data;
		},
		{
			getNextPageParam: (lastPage: PaginationResponse<EventItemResponseType>) => {
				return lastPage.hasNextPage ? lastPage.nextPage : undefined;
			},
			getPreviousPageParam: (firstPage: PaginationResponse<EventItemResponseType>) => {
				return firstPage.hasPrevPage ? firstPage.prevPage : undefined;
			},
			keepPreviousData: true,
			staleTime: 5 * 60 * 1000, // 5 minutes
		}
	);
}

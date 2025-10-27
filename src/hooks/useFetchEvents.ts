/*
 * Developer: Oussema Chargui
 * Company: Avocat Project
 * Date: 10/7/2025
 */

import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { QueryBuilder } from "../services/QueryBuilder";
import { queryKeys } from "../services/QueryClientManager";
import { eventService } from "../services/EventService";
import useQueryParams from "./useQueryParams";

interface IPaginationParams extends Record<string, unknown> {
	page?: number;
	limit?: number;
	search?: string;
	client?: string;
	lawsuit?: string;
}

export function useFetchEvents() {
	const {
		limit = 10,
		page = 1,
		search = "",
		client,
		lawsuit,
	} = useQueryParams<IPaginationParams>();
	const navigate = useNavigate();

	const response = useQuery(
		[
			queryKeys.EVENTS,
			{
				page,
				limit,
				search,
				client,
				lawsuit,
			},
		] as const,
		({ queryKey }) => {
			const [, { page, limit, search, client, lawsuit }] = queryKey;
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

			return eventService.getAll({ page, limit, ...filter });
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

import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { QueryBuilder } from "../services/QueryBuilder";
import { queryKeys } from "../services/QueryClientManager";
import { lawsuitService } from "../services/LawsuitService";
import useQueryParams from "./useQueryParams";

interface IPaginationParams {
	page?: number;
	limit?: number;
	search?: string;
	client?: string;
	status?: string;
	court?: string;
	lawsuitStage?: string;
	lawsuitType?: string;
	[key: string]: unknown;
}

export function useFetchLawsuits() {
	const {
		limit = 10,
		page = 1,
		search = "",
		client = "",
		status = "",
		court = "",
		lawsuitStage = "",
		lawsuitType = "",
	} = useQueryParams<IPaginationParams>();
	const navigate = useNavigate();

	const response = useQuery(
		[
			queryKeys.LAWSUITS,
			{
				page: page,
				limit: limit,
				search,
				client,
				status,
				court,
				lawsuitStage,
				lawsuitType,
			},
		] as const,
		({ queryKey }) => {
			const [, { page, limit, search, client, status, court, lawsuitStage, lawsuitType }] = queryKey;
			const filter: {
				search?: string;
				client?: string;
				status?: string;
				court?: string;
				lawsuitStage?: string;
				lawsuitType?: string;
			} = {};
			if (search && search.length !== 0) {
				filter.search = search;
			}
			if (client && client.length !== 0) {
				filter.client = client;
			}
			if (status && status.length !== 0) {
				filter.status = status;
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

			return lawsuitService.getAll({ page, limit, ...filter });
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

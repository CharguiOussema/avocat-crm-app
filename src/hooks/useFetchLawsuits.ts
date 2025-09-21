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
}

export function useFetchLawsuits() {
	const {
		limit = 10,
		page = 1,
		search = "",
		client = "",
		status = "",
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
			},
		] as const,
		({ queryKey }) => {
			const [, { page, limit, search, client, status }] = queryKey;
			const filter: { search?: string; client?: string; status?: string } = {};
			if (search && search.length !== 0) {
				filter.search = search;
			}
			if (client && client.length !== 0) {
				filter.client = client;
			}
			if (status && status.length !== 0) {
				filter.status = status;
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

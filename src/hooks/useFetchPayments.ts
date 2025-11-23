import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { QueryBuilder } from "../services/QueryBuilder";
import { queryKeys } from "../services/QueryClientManager";
import { paymentService } from "../services/PaymentService";
import useQueryParams from "./useQueryParams";

interface IPaginationParams {
	page?: number;
	limit?: number;
	search?: string;
	[key: string]: unknown;
}

export function useFetchPayments() {
	const {
		limit = 10,
		page = 1,
		search = "",
	} = useQueryParams<IPaginationParams>();
	const navigate = useNavigate();

	const response = useQuery(
		[
			queryKeys.PAYMENTS,
			{
				page: page,
				limit: limit,
				search,
			},
		] as const,
		({ queryKey }) => {
			const [, { page, limit, search }] = queryKey;
			const filter: { search?: string } = {};
			if (search && search.length !== 0) {
				filter.search = search;
			}

			return paymentService.getAll({ page, limit, ...filter });
		},
		{ keepPreviousData: true }
	);

	const handleTableChange = (pagination: {
		pageSize: number;
		current: number;
	}) => {
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

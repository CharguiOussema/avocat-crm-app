import { useQuery } from "react-query";
import { clientPaymentService } from "../services/ClientPaymentService";
import { queryKeys } from "../services/QueryClientManager";
import useQueryParams from "./useQueryParams";

interface QueryParams extends Record<string, unknown> {
	search?: string;
	client?: string;
	page?: number;
	limit?: number;
}

export const useFetchClientPayments = () => {
	const { search = "", client = "", page = 1, limit = 10 } = useQueryParams<QueryParams>();

	const response = useQuery(
		[queryKeys.CLIENT_PAYMENTS, { search, client, page, limit }],
		() =>
			clientPaymentService.getAll({
				search: search || undefined,
				client: client || undefined,
				page,
				limit,
			}),
		{
			keepPreviousData: true,
			staleTime: 5 * 60 * 1000, // 5 minutes
		}
	);

	return { response };
};

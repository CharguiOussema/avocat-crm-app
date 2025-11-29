/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 11/29/2025
 */

import { useInfiniteQuery } from "react-query";
import { clientPaymentService } from "../services/ClientPaymentService";
import { queryKeys } from "../services/QueryClientManager";

interface UseInfiniteClientPaymentsParams {
	search?: string;
	client?: string;
	limit?: number;
}

export const useInfiniteClientPayments = ({
	search = "",
	client = "",
	limit = 20,
}: UseInfiniteClientPaymentsParams) => {
	return useInfiniteQuery(
		[queryKeys.CLIENT_PAYMENTS, { search, client, limit }],
		({ pageParam = 1 }) =>
			clientPaymentService.getAll({
				search: search || undefined,
				client: client || undefined,
				page: pageParam,
				limit,
			}),
		{
			getNextPageParam: (lastPage) => {
				const currentPage = lastPage.data.page;
				const totalPages = lastPage.data.totalPages;
				return currentPage < totalPages ? currentPage + 1 : undefined;
			},
			keepPreviousData: true,
			staleTime: 5 * 60 * 1000, // 5 minutes
		}
	);
};

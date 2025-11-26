import { useQuery } from "react-query";
import { clientPaymentService } from "../services/ClientPaymentService";
import { queryKeys } from "../services/QueryClientManager";

export const useFetchClientPaymentById = (id: string | undefined) => {
	const response = useQuery(
		[queryKeys.CLIENT_PAYMENT_DETAILS, id],
		() => clientPaymentService.getById(id!),
		{
			enabled: !!id,
			staleTime: 5 * 60 * 1000, // 5 minutes
		}
	);

	return { response };
};

import { useQuery } from "react-query";
import { clientPaymentService } from "../services/ClientPaymentService";
import { queryKeys } from "../services/QueryClientManager";

export const useFetchClientPaymentsByClient = (clientId: string | undefined) => {
	const response = useQuery(
		[queryKeys.CLIENT_PAYMENTS, { client: clientId }],
		() =>
			clientPaymentService.getAll({
				client: clientId,
				limit: 100, // Get all client payments for this client
			}),
		{
			enabled: !!clientId,
			staleTime: 5 * 60 * 1000, // 5 minutes
		}
	);

	return { response };
};

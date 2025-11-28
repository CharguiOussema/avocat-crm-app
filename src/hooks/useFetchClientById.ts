import { useQuery } from "react-query";
import { clientService } from "../services/ClientService";
import { queryKeys } from "../services/QueryClientManager";

export const useFetchClientById = (id: string | undefined) => {
	const response = useQuery(
		[queryKeys.CLIENT_DETAILS, id],
		() => clientService.getById(id!),
		{
			enabled: !!id,
			staleTime: 5 * 60 * 1000, // 5 minutes
		}
	);

	return { response };
};

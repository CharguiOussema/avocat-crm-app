import { useQuery } from "react-query";
import { lawsuitService } from "../services/LawsuitService";
import { queryKeys } from "../services/QueryClientManager";

export const useFetchLawsuitsByClient = (clientId: string | undefined) => {
	const response = useQuery(
		[queryKeys.LAWSUITS, { client: clientId }],
		() =>
			lawsuitService.getAll({
				client: clientId,
				limit: 100, // Get all lawsuits for this client
			}),
		{
			enabled: !!clientId,
			staleTime: 5 * 60 * 1000, // 5 minutes
		}
	);

	return { response };
};

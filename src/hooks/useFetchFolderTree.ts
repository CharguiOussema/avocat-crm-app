import { useQuery } from "react-query";
import { queryKeys } from "../services/QueryClientManager";
import { folderService } from "../services/FolderService";

export function useFetchFolderTree(folderId?: string) {
	return useQuery(
		[queryKeys.FOLDER_TREE, folderId] as const,
		() => folderService.getTree(folderId),
		{
			keepPreviousData: true,
			staleTime: 1000 * 60 * 2, // 2 minutes
		}
	);
}

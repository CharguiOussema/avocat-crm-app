import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { QueryBuilder } from "../services/QueryBuilder";
import { queryKeys } from "../services/QueryClientManager";
import { folderService } from "../services/FolderService";
import useQueryParams from "./useQueryParams";

interface IPaginationParams {
	page?: number;
	limit?: number;
	search?: string;
	parent?: string;
	clientId?: string;
	lawsuitId?: string;
	name?: string;
	[key: string]: unknown;
}

export function useFetchFolders() {
	const {
		limit = 10,
		page = 1,
		search = "",
		parent = "",
		clientId = "",
		lawsuitId = "",
		name = "",
	} = useQueryParams<IPaginationParams>();
	const navigate = useNavigate();

	const response = useQuery(
		[
			queryKeys.FOLDERS,
			{
				page: page,
				limit: limit,
				search,
				parent,
				clientId,
				lawsuitId,
				name,
			},
		] as const,
		({ queryKey }) => {
			const [, { page, limit, search, parent, clientId, lawsuitId, name }] = queryKey;
			const filter: {
				search?: string;
				parent?: string;
				clientId?: string;
				lawsuitId?: string;
				name?: string;
			} = {};
			if (search && search.length !== 0) {
				filter.search = search;
			}
			if (parent && parent.length !== 0) {
				filter.parent = parent;
			}
			if (clientId && clientId.length !== 0) {
				filter.clientId = clientId;
			}
			if (lawsuitId && lawsuitId.length !== 0) {
				filter.lawsuitId = lawsuitId;
			}
			if (name && name.length !== 0) {
				filter.name = name;
			}

			return folderService.getAll({ page, limit, ...filter });
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

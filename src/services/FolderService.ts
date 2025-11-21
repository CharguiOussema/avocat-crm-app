import {
	FolderCreateRequestType,
	FolderUpdateRequestType,
	FolderResponseType,
	FolderListResponseType,
	FolderTreeWithRootFilesResponseType,
} from "../models/folder";
import { QueryBuilder } from "./QueryBuilder";
import { baseHttpClient } from "./abstract/BaseHttpClient";

interface GetAllFoldersParams {
	page?: number;
	limit?: number;
	search?: string;
	parent?: string;
	clientId?: string;
	lawsuitId?: string;
	name?: string;
}

class FolderService {
	private instance = baseHttpClient.instance;

	// Get all folders with pagination and filters
	getAll = (params?: GetAllFoldersParams) => {
		const url = QueryBuilder.generateURL("/api/folders")
			.setQueryParam("page", params?.page)
			.setQueryParam("limit", params?.limit)
			.setQueryParam("search", params?.search)
			.setQueryParam("parent", params?.parent)
			.setQueryParam("clientId", params?.clientId)
			.setQueryParam("lawsuitId", params?.lawsuitId)
			.setQueryParam("name", params?.name)
			.build();
		return this.instance.get<FolderListResponseType>(url);
	};

	// Get folder tree (hierarchical structure) with root files
	getTree = (folderId?: string) => {
		const url = QueryBuilder.generateURL("/api/folders/tree")
			.setQueryParam("folderId", folderId)
			.build();
		return this.instance.get<FolderTreeWithRootFilesResponseType>(url);
	};

	// Get folder by ID
	getById = (id: string) =>
		this.instance.get<FolderResponseType>(`/api/folders/${id}`);

	// Create new folder
	create = (body: FolderCreateRequestType) =>
		this.instance.post<FolderResponseType>("/api/folders", body);

	// Update folder
	update = (id: string, body: FolderUpdateRequestType) =>
		this.instance.put<FolderResponseType>(`/api/folders/${id}`, body);

	// Delete folder (soft delete)
	delete = (id: string) => this.instance.delete(`/api/folders/${id}`);

	// Calculate folder size
	calculateSize = (id: string) =>
		this.instance.post<{ size: number }>(`/api/folders/${id}/calculate-size`);

	// Download folder as ZIP
	download = (id: string) =>
		this.instance.get(`/api/folders/${id}/download`, {
			responseType: 'blob'
		});
}

const folderService = new FolderService();
export { folderService };

import {
	ClientItemResponseType,
	CreateClientBodyRequest,
	UpdateClientBodyRequest,
} from "../models/client";
import { PaginationResponse } from "../models/ResponseType";
import { QueryBuilder } from "./QueryBuilder";
import { baseHttpClient } from "./abstract/BaseHttpClient";

interface GetAllClientsParams {
	page?: number;
	limit?: number;
	search?: string;
}

class ClientService {
	private instance = baseHttpClient.instance;

	// !example of get all with pagination and filters
	getAll = (params?: GetAllClientsParams) => {
		const url = QueryBuilder.generateURL("/api/clients")
			.setQueryParam("page", params?.page)
			.setQueryParam("limit", params?.limit)
			.setQueryParam("search", params?.search)
			.build();
		return this.instance.get<PaginationResponse<ClientItemResponseType>>(url);
	};

	// !example of get by id
	getById = (id: string) =>
		this.instance.get<ClientItemResponseType>(`/api/clients/${id}`);

	// !example of create
	create = (body: CreateClientBodyRequest) => {
		return this.instance.post<ClientItemResponseType>("/api/clients", body);
	};

	// !example of update
	update = (body: UpdateClientBodyRequest) => {
		return this.instance.put<ClientItemResponseType>("/api/clients", body);
	};

	// !example of delete
	delete = (id: string) => this.instance.delete(`/api/clients/${id}`);

	// !example of filter endpoint
	filter = () =>
		this.instance.get<Array<{ label: string; value: string }>>(
			"/api/clients/filter"
		);

	// Get client avatar
	getClientAvatar = (clientId: string) =>
		this.instance.get(`/api/files/serve/client-avatar/${clientId}`, {
			responseType: 'blob'
		});
}

const clientService = new ClientService();
export { clientService };

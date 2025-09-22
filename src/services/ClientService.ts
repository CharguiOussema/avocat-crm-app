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
	create = (body: CreateClientBodyRequest) =>
		this.instance.post<ClientItemResponseType>("/api/clients", body);

	// Create client with avatar
	createWithAvatar = (body: CreateClientBodyRequest, avatarFile?: File) => {
		const formData = new FormData();

		// Add form fields
		formData.append('fullName', body.fullName);
		if (body.email) formData.append('email', body.email);
		if (body.phoneNumber) formData.append('phoneNumber', body.phoneNumber);
		if (body.cin) formData.append('cin', body.cin);
		if (body.location) formData.append('location', body.location);

		// Add avatar file if provided
		if (avatarFile) {
			formData.append('avatar', avatarFile);
		}

		return this.instance.post<ClientItemResponseType>("/api/clients", formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});
	};

	// !example of update
	update = (body: UpdateClientBodyRequest) =>
		this.instance.put<ClientItemResponseType>("/api/clients", body);

	// Update client with avatar
	updateWithAvatar = (body: UpdateClientBodyRequest, avatarFile?: File) => {
		const formData = new FormData();

		// Add form fields
		formData.append('_id', body._id);
		formData.append('fullName', body.fullName);
		if (body.email) formData.append('email', body.email);
		if (body.phoneNumber) formData.append('phoneNumber', body.phoneNumber);
		if (body.cin) formData.append('cin', body.cin);
		if (body.location) formData.append('location', body.location);

		// Add avatar file if provided
		if (avatarFile) {
			formData.append('avatar', avatarFile);
		}

		return this.instance.put<ClientItemResponseType>("/api/clients", formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});
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

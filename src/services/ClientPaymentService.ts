import {
	ClientPaymentItemResponseType,
	CreateClientPaymentBodyRequest,
	UpdateClientPaymentBodyRequest,
} from "../models/clientPayment";
import { PaginationResponse } from "../models/ResponseType";
import { QueryBuilder } from "./QueryBuilder";
import { baseHttpClient } from "./abstract/BaseHttpClient";

interface GetAllClientPaymentsParams {
	page?: number;
	limit?: number;
	search?: string;
	client?: string;
}

class ClientPaymentService {
	private instance = baseHttpClient.instance;

	// Get all client payments with pagination and filters
	getAll = (params?: GetAllClientPaymentsParams) => {
		const url = QueryBuilder.generateURL("/api/clientPayments")
			.setQueryParam("page", params?.page)
			.setQueryParam("limit", params?.limit)
			.setQueryParam("search", params?.search)
			.setQueryParam("client", params?.client)
			.build();
		return this.instance.get<PaginationResponse<ClientPaymentItemResponseType>>(url);
	};

	// Get client payment by id
	getById = (id: string) =>
		this.instance.get<ClientPaymentItemResponseType>(`/api/clientPayments/${id}`);

	// Create client payment
	create = (body: CreateClientPaymentBodyRequest) => {
		return this.instance.post<ClientPaymentItemResponseType>("/api/clientPayments", body);
	};

	// Update client payment
	update = (body: UpdateClientPaymentBodyRequest) => {
		return this.instance.put<ClientPaymentItemResponseType>("/api/clientPayments", body);
	};

	// Delete client payment (soft delete)
	delete = (id: string) => this.instance.delete<{ message: string }>(`/api/clientPayments/${id}`);
}

const clientPaymentService = new ClientPaymentService();
export { clientPaymentService };

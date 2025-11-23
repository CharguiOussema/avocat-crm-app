import {
	PaymentItemResponseType,
	CreatePaymentBodyRequest,
	UpdatePaymentBodyRequest,
} from "../models/payment";
import { PaginationResponse } from "../models/ResponseType";
import { QueryBuilder } from "./QueryBuilder";
import { baseHttpClient } from "./abstract/BaseHttpClient";

interface GetAllPaymentsParams {
	page?: number;
	limit?: number;
	search?: string;
}

class PaymentService {
	private instance = baseHttpClient.instance;

	// Get all payments with pagination and filters
	getAll = (params?: GetAllPaymentsParams) => {
		const url = QueryBuilder.generateURL("/api/payments")
			.setQueryParam("page", params?.page)
			.setQueryParam("limit", params?.limit)
			.setQueryParam("search", params?.search)
			.build();
		return this.instance.get<PaginationResponse<PaymentItemResponseType>>(url);
	};

	// Get payment by id
	getById = (id: string) =>
		this.instance.get<PaymentItemResponseType>(`/api/payments/${id}`);

	// Create payment
	create = (body: CreatePaymentBodyRequest) => {
		return this.instance.post<PaymentItemResponseType>("/api/payments", body);
	};

	// Update payment
	update = (body: UpdatePaymentBodyRequest) => {
		return this.instance.put<PaymentItemResponseType>("/api/payments", body);
	};

	// Delete payment (soft delete)
	delete = (id: string) => this.instance.delete<{ message: string }>(`/api/payments/${id}`);
}

const paymentService = new PaymentService();
export { paymentService };

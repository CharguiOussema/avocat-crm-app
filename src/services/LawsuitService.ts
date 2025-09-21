import {
	CreateLawsuitBodyRequest,
	LawsuitItemResponseType,
	UpdateLawsuitBodyRequest,
} from "../models/lawsuit";
import { PaginationResponse } from "../models/ResponseType";
import { QueryBuilder } from "./QueryBuilder";
import { baseHttpClient } from "./abstract/BaseHttpClient";

interface GetAllLawsuitsParams {
	page?: number;
	limit?: number;
	search?: string;
	client?: string;
	status?: string;
}

class LawsuitService {
	private instance = baseHttpClient.instance;

	// !example of get all with pagination and filters
	getAll = (params?: GetAllLawsuitsParams) => {
		const url = QueryBuilder.generateURL("/api/lawsuits")
			.setQueryParam("page", params?.page)
			.setQueryParam("limit", params?.limit)
			.setQueryParam("search", params?.search)
			.setQueryParam("client", params?.client)
			.setQueryParam("status", params?.status)
			.build();
		return this.instance.get<PaginationResponse<LawsuitItemResponseType>>(url);
	};

	// !example of get by id
	getById = (id: string) =>
		this.instance.get<LawsuitItemResponseType>(`/api/lawsuits/${id}`);

	// !example of create
	create = (body: CreateLawsuitBodyRequest) =>
		this.instance.post<LawsuitItemResponseType>("/api/lawsuits", body);

	// !example of update
	update = (body: UpdateLawsuitBodyRequest) =>
		this.instance.put<LawsuitItemResponseType>("/api/lawsuits", body);

	// !example of delete
	delete = (id: string) => this.instance.delete(`/api/lawsuits/${id}`);

	// !example of filter endpoint
	filter = () =>
		this.instance.get<Array<{ label: string; value: string }>>(
			"/api/lawsuits/filter"
		);
}

const lawsuitService = new LawsuitService();
export { lawsuitService };

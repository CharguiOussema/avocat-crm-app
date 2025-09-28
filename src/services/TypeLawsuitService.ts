import {
	TypeLawsuitModelType,
	CreateTypeLawsuitBodyRequest,
	UpdateTypeLawsuitBodyRequest,
} from "../models/typeLawsuit";
import { PaginationResponse } from "../models/ResponseType";
import { QueryBuilder } from "./QueryBuilder";
import { baseHttpClient } from "./abstract/BaseHttpClient";

interface GetAllTypeLawsuitsParams {
	page?: number;
	limit?: number;
	search?: string;
}

class TypeLawsuitService {
	private instance = baseHttpClient.instance;

	getAll = (params?: GetAllTypeLawsuitsParams) => {
		const url = QueryBuilder.generateURL("/api/typeLawsuit")
			.setQueryParam("page", params?.page)
			.setQueryParam("limit", params?.limit)
			.setQueryParam("search", params?.search)
			.build();
		return this.instance.get<PaginationResponse<TypeLawsuitModelType>>(url);
	};

	getById = (id: string) =>
		this.instance.get<TypeLawsuitModelType>(`/api/typeLawsuit/${id}`);

	create = (body: CreateTypeLawsuitBodyRequest) =>
		this.instance.post<TypeLawsuitModelType>("/api/typeLawsuit", body);

	update = (body: UpdateTypeLawsuitBodyRequest) =>
		this.instance.put<TypeLawsuitModelType>("/api/typeLawsuit", body);

	delete = (id: string) => this.instance.delete(`/api/typeLawsuit/${id}`);

	filter = () =>
		this.instance.get<Array<{ label: string; value: string }>>(
			"/api/typeLawsuit/filter"
		);
}

const typeLawsuitService = new TypeLawsuitService();
export { typeLawsuitService };
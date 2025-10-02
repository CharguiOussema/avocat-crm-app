import {
	CompanyItemResponseType,
	CreateCompanyBodyRequest,
	UpdateCompanyBodyRequest,
} from "../models/company";
import { PaginationResponse } from "../models/ResponseType";
import { QueryBuilder } from "./QueryBuilder";
import { baseHttpClient } from "./abstract/BaseHttpClient";

interface GetAllCompaniesParams {
	page?: number;
	limit?: number;
	search?: string;
}

class CompanyService {
	private instance = baseHttpClient.instance;

	// !example of get all with pagination and filters
	getAll = (params?: GetAllCompaniesParams) => {
		const url = QueryBuilder.generateURL("/api/companys")
			.setQueryParam("page", params?.page)
			.setQueryParam("limit", params?.limit)
			.setQueryParam("search", params?.search)
			.build();
		return this.instance.get<PaginationResponse<CompanyItemResponseType>>(url);
	};

	// !example of get by id
	getById = (id: string) =>
		this.instance.get<CompanyItemResponseType>(`/api/companys/${id}`);

	// Get current user's company
	getCurrentCompany = () =>
		this.instance.get<CompanyItemResponseType>("/api/companys/currentCompany");

	// !example of create
	create = (body: CreateCompanyBodyRequest) =>
		this.instance.post<CompanyItemResponseType>("/api/companys", body);

	// !example of update
	update = (body: UpdateCompanyBodyRequest) =>
		this.instance.put<CompanyItemResponseType>("/api/companys", body);

	// !example of delete
	delete = (id: string) => this.instance.delete(`/api/companys/${id}`);

	// !example of filter endpoint
	filter = () =>
		this.instance.get<Array<{ label: string; value: string }>>(
			"/api/companys/filter"
		);
}

const companyService = new CompanyService();
export { companyService };

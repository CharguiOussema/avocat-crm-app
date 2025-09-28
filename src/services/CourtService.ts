import {
	CourtModelType,
	CreateCourtBodyRequest,
	UpdateCourtBodyRequest,
} from "../models/court";
import { PaginationResponse } from "../models/ResponseType";
import { QueryBuilder } from "./QueryBuilder";
import { baseHttpClient } from "./abstract/BaseHttpClient";

interface GetAllCourtsParams {
	page?: number;
	limit?: number;
	search?: string;
}

class CourtService {
	private instance = baseHttpClient.instance;

	getAll = (params?: GetAllCourtsParams) => {
		const url = QueryBuilder.generateURL("/api/courts")
			.setQueryParam("page", params?.page)
			.setQueryParam("limit", params?.limit)
			.setQueryParam("search", params?.search)
			.build();
		return this.instance.get<PaginationResponse<CourtModelType>>(url);
	};

	getById = (id: string) =>
		this.instance.get<CourtModelType>(`/api/courts/${id}`);

	create = (body: CreateCourtBodyRequest) =>
		this.instance.post<CourtModelType>("/api/courts", body);

	update = (body: UpdateCourtBodyRequest) =>
		this.instance.put<CourtModelType>("/api/courts", body);

	delete = (id: string) => this.instance.delete(`/api/courts/${id}`);

	filter = () =>
		this.instance.get<Array<{ label: string; value: string }>>(
			"/api/courts/filter"
		);
}

const courtService = new CourtService();
export { courtService };
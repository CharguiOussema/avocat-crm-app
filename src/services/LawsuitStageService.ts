import {
	LawsuitStageModelType,
	CreateLawsuitStageBodyRequest,
	UpdateLawsuitStageBodyRequest,
} from "../models/lawsuitStage";
import { PaginationResponse } from "../models/ResponseType";
import { QueryBuilder } from "./QueryBuilder";
import { baseHttpClient } from "./abstract/BaseHttpClient";

interface GetAllLawsuitStagesParams {
	page?: number;
	limit?: number;
	search?: string;
}

class LawsuitStageService {
	private instance = baseHttpClient.instance;

	getAll = (params?: GetAllLawsuitStagesParams) => {
		const url = QueryBuilder.generateURL("/api/lawsuitStages")
			.setQueryParam("page", params?.page)
			.setQueryParam("limit", params?.limit)
			.setQueryParam("search", params?.search)
			.build();
		return this.instance.get<PaginationResponse<LawsuitStageModelType>>(url);
	};

	getById = (id: string) =>
		this.instance.get<LawsuitStageModelType>(`/api/lawsuitStages/${id}`);

	create = (body: CreateLawsuitStageBodyRequest) =>
		this.instance.post<LawsuitStageModelType>("/api/lawsuitStages", body);

	update = (body: UpdateLawsuitStageBodyRequest) =>
		this.instance.put<LawsuitStageModelType>("/api/lawsuitStages", body);

	delete = (id: string) => this.instance.delete(`/api/lawsuitStages/${id}`);

	filter = () =>
		this.instance.get<Array<{ label: string; value: string }>>(
			"/api/lawsuitStages/filter"
		);
}

const lawsuitStageService = new LawsuitStageService();
export { lawsuitStageService };
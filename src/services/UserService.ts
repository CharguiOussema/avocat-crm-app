import {
	CreateUserBodyRequest,
	LoginBodyRequest,
	UpdateUserBodyRequest,
	UserItemResponseType,
	UserLoginResponseType,
} from "../models/user";
import { PaginationResponse } from "../models/ResponseType";
import { QueryBuilder } from "./QueryBuilder";
import { baseHttpClient } from "./abstract/BaseHttpClient";

interface GetAllUsersParams {
	page?: number;
	limit?: number;
	search?: string;
	roles?: string;
}

class UserService {
	private instance = baseHttpClient.instance;

	// !example of login
	login = (body: LoginBodyRequest) =>
		this.instance.post<UserLoginResponseType>("/api/users/login", body);

	// !example of get current user
	getCurrentUser = () =>
		this.instance.get<UserItemResponseType>("/api/users/currentUser");

	// !example of get all with pagination and filters
	getAll = (params?: GetAllUsersParams) => {
		const url = QueryBuilder.generateURL("/api/users")
			.setQueryParam("page", params?.page)
			.setQueryParam("limit", params?.limit)
			.setQueryParam("search", params?.search)
			.setQueryParam("roles", params?.roles)
			.build();
		return this.instance.get<PaginationResponse<UserItemResponseType>>(url);
	};

	// !example of get by id
	getById = (id: string) =>
		this.instance.get<UserItemResponseType>(`/api/users/${id}`);

	// !example of create
	create = (body: CreateUserBodyRequest) => {
		return this.instance.post<UserItemResponseType>("/api/users", body);
	};

	// !example of update
	update = (body: UpdateUserBodyRequest) => {
		return this.instance.put<UserItemResponseType>("/api/users", body);
	};

	// !example of delete
	delete = (id: string) => this.instance.delete<{ message: string }>(`/api/users/${id}`);

	// Bulk delete users
	bulkDelete = (ids: string[]) =>
		this.instance.post<{ message: string; deletedCount: number }>("/api/users/bulk-delete", {
			ids
		});

	// !example of filter endpoint
	filter = () =>
		this.instance.get<Array<{ label: string; value: string }>>(
			"/api/users/filter"
		);
}

const userService = new UserService();
export { userService };

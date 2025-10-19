/*
 * Developer: Oussema Chargui
 * Company: Avocat Project
 * Date: 10/7/2025
 */

import {
	CreateEventBodyRequest,
	EventItemResponseType,
	UpdateEventBodyRequest,
} from "../models/event";
import { PaginationResponse } from "../models/ResponseType";
import { QueryBuilder } from "./QueryBuilder";
import { baseHttpClient } from "./abstract/BaseHttpClient";

interface GetAllEventsParams {
	page?: number;
	limit?: number;
	search?: string;
	client?: string;
	lawsuit?: string;
}

class EventService {
	private instance = baseHttpClient.instance;

	// Get all events with pagination and filters
	getAll = (params?: GetAllEventsParams) => {
		const url = QueryBuilder.generateURL("/api/events")
			.setQueryParam("page", params?.page)
			.setQueryParam("limit", params?.limit)
			.setQueryParam("search", params?.search)
			.setQueryParam("client", params?.client)
			.setQueryParam("lawsuit", params?.lawsuit)
			.build();
		return this.instance.get<PaginationResponse<EventItemResponseType>>(url);
	};

	// Get event by id
	getById = (id: string) =>
		this.instance.get<EventItemResponseType>(`/api/events/${id}`);

	// Create new event
	create = (body: CreateEventBodyRequest) =>
		this.instance.post<EventItemResponseType>("/api/events", body);

	// Update existing event
	update = (body: UpdateEventBodyRequest) =>
		this.instance.put<EventItemResponseType>("/api/events", body);

	// Delete event (soft delete)
	delete = (id: string) => this.instance.delete(`/api/events/${id}`);

	// Get events for filter dropdown
	filter = () =>
		this.instance.get<Array<{ label: string; value: string }>>(
			"/api/events/filter"
		);
}

const eventService = new EventService();
export { eventService };

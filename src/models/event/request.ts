/*
 * Developer: Oussema Chargui
 * Company: Avocat Project
 * Date: 10/7/2025
 */

import { EventModelType } from "./model";

export type CreateEventBodyRequest = Pick<
  EventModelType,
  "name" | "description" | "clients" | "lawsuit" | "startDate" | "endDate"
>;

export type UpdateEventBodyRequest = Pick<EventModelType, "_id"> &
  CreateEventBodyRequest;

export type GetAllEventQueryRequest = {
  search?: string;
  limit: number;
  page: number;
};

export type EventById = Pick<EventModelType, "_id">;

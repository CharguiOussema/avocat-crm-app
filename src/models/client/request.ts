/*
 * Developer: Oussema Chargui
 * Company: Avocat Project
 * Date: 12/1/2024
 */

import { ClientModelType } from "./model";

export type CreateClientBodyRequest = Pick<
  ClientModelType,
  "avatar" | "fullName" | "email" | "phoneNumber" | "cin" | "location"
>;
export type UpdateClientBodyRequest = Pick<ClientModelType, "_id"> &
  CreateClientBodyRequest;
export type GetAllClientQueryRequest = {
  search?: string;
  limit: number;
  page: number;
};
export type ClientById = Pick<ClientModelType, "_id">;

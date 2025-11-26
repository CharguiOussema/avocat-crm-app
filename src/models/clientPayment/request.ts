/*
 * Developer: Oussema Chargui
 * Company: Avocat Project
 * Date: 11/25/2025
 */

import { ClientPaymentModelType } from "./model";

export type CreateClientPaymentBodyRequest = Pick<
  ClientPaymentModelType,
  "title" | "description" | "lawsuit" | "client" | "targetPrice"
>;

export type UpdateClientPaymentBodyRequest = Pick<
  ClientPaymentModelType,
  "_id"
> &
  CreateClientPaymentBodyRequest;

export type GetAllClientPaymentQueryRequest = {
  search?: string;
  client?: string;
  limit: number;
  page: number;
};

export type ClientPaymentById = Pick<ClientPaymentModelType, "_id">;

/*
 * Developer: Oussema Chargui
 * Company: Avocat Project
 * Date: 11/22/2025
 */

import { PaymentModelType } from "./model";

export type CreatePaymentBodyRequest = Pick<
  PaymentModelType,
  "description" | "type" | "price" | "clientPayment"
>;
export type UpdatePaymentBodyRequest = Pick<PaymentModelType, "_id"> &
  CreatePaymentBodyRequest;
export type GetAllPaymentQueryRequest = {
  search?: string;
  limit: number;
  page: number;
};
export type PaymentById = Pick<PaymentModelType, "_id">;

/*
 * Developer: Oussema Chargui
 * Company: Avocat Project
 * Date: 11/22/2025
 */

import { UserItemResponseType } from "../user";
import { PaymentModelType } from "./model";

export type PaymentItemResponseType = Pick<
  PaymentModelType,
  | "_id"
  | "description"
  | "type"
  | "price"
  | "clientPayment"
  | "updatedAt"
  | "createdAt"
> & {
  createdBy: UserItemResponseType;
  updatedBy: UserItemResponseType;
};

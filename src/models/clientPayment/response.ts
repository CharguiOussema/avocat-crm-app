/*
 * Developer: Oussema Chargui
 * Company: Avocat Project
 * Date: 11/25/2025
 */

import { UserItemResponseType } from "../user";
import { ClientItemResponseType } from "../client/response";
import { PaymentItemResponseType } from "../payment/response";

export type ClientPaymentItemResponseType = {
  _id: string;
  title: string;
  description: string | null;
  lawsuit: string | null;
  client: ClientItemResponseType;
  targetPrice: number;
  total: number;
  payments: PaymentItemResponseType[];
  createdAt: string;
  updatedAt: string;
  createdBy: UserItemResponseType;
  updatedBy: UserItemResponseType;
};

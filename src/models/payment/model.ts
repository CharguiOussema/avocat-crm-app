/*
 * Developer: Oussema Chargui
 * Company: Avocat Project
 * Date: 11/22/2025
 */

import { PAYMENT_TYPE } from "../consts";

export type PaymentModelType = {
  _id: string;
  description: string;
  type: PAYMENT_TYPE;
  price: number;
  clientPayment: string;
  company: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  isDeleted: boolean;
};

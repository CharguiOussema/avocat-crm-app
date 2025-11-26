/*
 * Developer: Oussema Chargui
 * Company: Avocat Project
 * Date: 11/25/2025
 */

export type ClientPaymentModelType = {
  _id: string;
  title: string;
  description: string | null;
  lawsuit: string | null;
  client: string;
  targetPrice: number;
  total: number;
  payments: string[];
  company: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  isDeleted: boolean;
};

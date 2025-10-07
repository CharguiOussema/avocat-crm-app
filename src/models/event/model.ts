/*
 * Developer: Oussema Chargui
 * Company: Avocat Project
 * Date: 10/7/2025
 */

export type EventModelType = {
  _id: string;
  name: string;
  description: string | null;
  clients: string[];
  lawsuit: string | null;
  startDate: string;
  endDate: string;
  company: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  isDeleted: boolean;
};

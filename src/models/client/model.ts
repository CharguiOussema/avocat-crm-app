/*
 * Developer: Oussema Chargui
 * Company: Avocat Project
 * Date: 12/1/2024
 */

export type ClientModelType = {
  _id: string;
  fullName: string;
  email: string | null;
  phoneNumber: string | null;
  cin: string | null;
  avatar: string | null;
  location: string | null;
  company: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  isDeleted: boolean;
};

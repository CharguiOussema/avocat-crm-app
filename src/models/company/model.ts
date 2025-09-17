/*
 * Developer: Oussema Chargui
 * Company: Avocat Project
 * Date: 11/17/2024
 */

export type CompanyModelType = {
  _id: string;
  name: string;
  webSite: string | null;
  email: string;
  logo: string | null;
  phoneNumber: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  isDeleted: boolean;
};

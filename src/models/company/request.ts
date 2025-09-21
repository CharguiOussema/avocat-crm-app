/*
 * Developer: Oussema Chargui
 * Company: Avocat Project
 * Date: 11/17/2024
 */

import { CompanyModelType } from "./model";

export type CreateCompanyBodyRequest = Pick<
  CompanyModelType,
  "name" | "webSite" | "logo" | "email" | "phoneNumber"
>;
export type UpdateCompanyBodyRequest = Pick<CompanyModelType, "_id"> &
  CreateCompanyBodyRequest;
export type GetAllCompanyQueryRequest = {
  search?: string;
  limit: number;
  page: number;
};
export type CompanyByIdRequest = Pick<CompanyModelType, "_id">;

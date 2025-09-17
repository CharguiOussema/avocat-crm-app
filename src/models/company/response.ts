/*
 * Developer: Oussema Chargui
 * Company: Avocat Project
 * Date: 11/17/2024
 */

import { CompanyModelType } from "./model";

export type CompanyItemResponseType = Pick<
  CompanyModelType,
  | "_id"
  | "email"
  | "logo"
  | "name"
  | "webSite"
  | "phoneNumber"
  | "createdAt"
  | "updatedAt"
  | "createdBy"
>;

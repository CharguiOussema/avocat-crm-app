/*
 * Developer: Oussema Chargui
 * Company: Avocat Project
 * Date: 5/18/2025
 */

import { TypeLawsuitModelType } from "./model";

export type CreateTypeLawsuitBodyRequest = Pick<TypeLawsuitModelType, "name">;
export type UpdateTypeLawsuitBodyRequest = Pick<TypeLawsuitModelType, "_id"> &
  CreateTypeLawsuitBodyRequest;
export type GetAllTypeLawsuitQueryRequest = {
  search?: string;
  limit: number;
  page: number;
};
export type TypeLawsuitByIdRequest = Pick<TypeLawsuitModelType, "_id">;

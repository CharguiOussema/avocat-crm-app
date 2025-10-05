/*
 * Developer: Oussema Chargui
 * Company: Avocat Project
 * Date: 5/18/2025
 */

import { LawsuitModelType } from "./model";

export type CreateLawsuitBodyRequest = Pick<
  LawsuitModelType,
  | "lawsuitCode"
  | "description"
  | "clients"
  | "court"
  | "lawsuitStage"
  | "lawsuitType"
  | "status"
>;
export type UpdateLawsuitBodyRequest = Pick<LawsuitModelType, "_id"> &
  CreateLawsuitBodyRequest;
export type GetAllLawsuitQueryRequest = {
  search?: string;
  limit: number;
  page: number;
};
export type LawsuitByIdRequest = Pick<LawsuitModelType, "_id">;

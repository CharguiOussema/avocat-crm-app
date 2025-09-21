/*
 * Developer: Oussema Chargui
 * Company: Avocat Project
 * Date: 5/25/2025
 */

import { LawsuitStageModelType } from "./model";

export type CreateLawsuitStageBodyRequest = Pick<LawsuitStageModelType, "name">;
export type UpdateLawsuitStageBodyRequest = Pick<LawsuitStageModelType, "_id"> &
  CreateLawsuitStageBodyRequest;
export type GetAllLawsuitStageQueryRequest = {
  search?: string;
  limit: number;
  page: number;
};
export type LawsuitStageByIdRequest = Pick<LawsuitStageModelType, "_id">;

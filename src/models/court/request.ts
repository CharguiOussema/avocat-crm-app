/*
 * Developer: Oussema Chargui
 * Company: Avocat Project
 * Date: 5/25/2025
 */

import { CourtModelType } from "./model";

export type CreateCourtBodyRequest = Pick<CourtModelType, "name">;
export type UpdateCourtBodyRequest = Pick<CourtModelType, "_id"> &
  CreateCourtBodyRequest;
export type GetAllCourtQueryRequest = {
  search?: string;
  limit: number;
  page: number;
};
export type CourtByIdRequest = Pick<CourtModelType, "_id">;

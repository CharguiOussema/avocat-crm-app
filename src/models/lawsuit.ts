import { LAWSUIT_STATUS } from "./consts";

export type LawsuitModelType = {
  _id: string;
  lawsuitCode: string;
  description?: string;
  clients: string[];
  court?: string;
  lawsuitStage?: string;
  lawsuitType?: string;
  status: LAWSUIT_STATUS;
  company: string;
  createdAt: string;
  createdBy: string;
  updatedBy: string;
  updatedAt: string;
  isDeleted: boolean;
};

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
  status?: string;
  client?: string;
  court?: string;
  lawsuitStage?: string;
  lawsuitType?: string;
  limit: number;
  page: number;
};
export type LawsuitByIdRequest = Pick<LawsuitModelType, "_id">;

export type LawsuitItemResponseType = Pick<
  LawsuitModelType,
  | "_id"
  | "lawsuitCode"
  | "description"
  | "clients"
  | "court"
  | "lawsuitStage"
  | "lawsuitType"
  | "status"
  | "createdAt"
  | "updatedAt"
  | "createdBy"
>;

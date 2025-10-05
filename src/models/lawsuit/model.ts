/*
 * Developer: Oussema Chargui
 * Company: Avocat Project
 * Date: 5/18/2025
 */

import { LAWSUIT_STATUS } from "../consts";

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
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  isDeleted: boolean;
};

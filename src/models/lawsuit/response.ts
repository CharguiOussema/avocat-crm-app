/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 3/10/2025
 */

import { UserItemResponseType } from "../user";
import { ClientItemResponseType } from "../client";
import { LawsuitStageResponseType } from "../lawsuitStage";
import { TypeLawsuitResponseType } from "../typeLawsuit";
import { CourtResponseType } from "../court";
import { LawsuitModelType } from "./model";

export type LawsuitItemResponseType = Pick<
  LawsuitModelType,
  "_id" | "lawsuitCode" | "description" | "status" | "createdAt" | "updatedAt"
> & {
  clients: ClientItemResponseType[];
  court?: CourtResponseType;
  lawsuitStage?: LawsuitStageResponseType;
  lawsuitType?: TypeLawsuitResponseType;
  createdBy: UserItemResponseType;
};

/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 3/10/2025
 */

import { UserItemResponseType } from "../user";
import { ClientItemResponseType } from "../client";
import { LawsuitStageResponseType } from "../lawsuitStage";
import { TypeLawsuitResponseType } from "../typeLawsuit";
import { LawsuitModelType } from "./model";

export type LawsuitItemResponseType = Pick<
  LawsuitModelType,
  "_id" | "lawsuitCode" | "status" | "createdAt" | "updatedAt"
> & {
  clients: ClientItemResponseType[];
  lawsuitStage: LawsuitStageResponseType;
  lawsuitType: TypeLawsuitResponseType;
  createdBy: UserItemResponseType;
};

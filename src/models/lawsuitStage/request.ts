/*
 * Developer: Oussema Chargui
 * Company: Avocat Project
 * Date: 5/25/2025
 */

import { LawsuitStageModelType } from "./model";

export type CreateLawsuitStageBodyRequest = Pick<LawsuitStageModelType, "name">;

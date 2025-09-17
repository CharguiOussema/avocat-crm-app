/*
 * Developer: Oussema Chargui
 * Company: Avocat Project
 * Date: 5/25/2025
 */

import { CourtModelType } from "./model";

export type CourtResponseType = Pick<CourtModelType, "_id" | "name">;

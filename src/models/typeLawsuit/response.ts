/*
 * Developer: Oussema Chargui
 * Company: Avocat Project
 * Date: 5/18/2025
 */

import { TypeLawsuitModelType } from "./model";

export type TypeLawsuitResponseType = Pick<
  TypeLawsuitModelType,
  "name" | "_id"
>;

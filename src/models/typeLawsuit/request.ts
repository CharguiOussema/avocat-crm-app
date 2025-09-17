/*
 * Developer: Oussema Chargui
 * Company: Avocat Project
 * Date: 5/18/2025
 */

import { TypeLawsuitModelType } from "./model";

export type CreateTypeLawsuitBodyRequest = Pick<TypeLawsuitModelType, "name">;

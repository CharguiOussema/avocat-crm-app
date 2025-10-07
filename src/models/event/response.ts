/*
 * Developer: Oussema Chargui
 * Company: Avocat Project
 * Date: 10/7/2025
 */

import { UserItemResponseType } from "../user";
import { ClientItemResponseType } from "../client";
import { LawsuitItemResponseType } from "../lawsuit";
import { EventModelType } from "./model";

export type EventItemResponseType = Pick<
  EventModelType,
  | "_id"
  | "name"
  | "description"
  | "startDate"
  | "endDate"
  | "updatedAt"
  | "createdAt"
> & {
  createdBy: UserItemResponseType;
  clients: ClientItemResponseType[];
  lawsuit: LawsuitItemResponseType | null;
};

/*
 * Developer: Oussema Chargui
 * Company: Avocat Project
 * Date: 12/1/2024
 */

import { UserItemResponseType } from "../user";
import { ClientModelType } from "./model";

export type ClientItemResponseType = Pick<
  ClientModelType,
  | "_id"
  | "avatar"
  | "cin"
  | "email"
  | "fullName"
  | "phoneNumber"
  | "location"
  | "updatedAt"
  | "createdAt"
> & {
  createdBy: UserItemResponseType;
};

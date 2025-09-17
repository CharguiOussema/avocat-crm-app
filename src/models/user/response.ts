import { UserModelType } from "./model";

export type UserItemResponseType = Pick<
  UserModelType,
  | "_id"
  | "fullName"
  | "avatar"
  | "email"
  | "phoneNumber"
  | "cin"
  | "roles"
  | "createdAt"
  | "updatedAt"
  | "createdBy"
>;

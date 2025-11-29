import { UserModelType } from "./model";

export type UserItemResponseType = Pick<
  UserModelType,
  | "_id"
  | "fullName"
  | "avatar"
  | "email"
  | "phoneNumber"
  | "cin"
  | "role"
  | "userAccess"
  | "createdAt"
  | "updatedAt"
  | "createdBy"
>;
export type UserLoginResponseType = { accessToken: string };

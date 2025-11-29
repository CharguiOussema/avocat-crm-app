import { USER_ROLES, APP_ACCESS } from "./consts";

export type UserAccessType = {
  dashboard: APP_ACCESS;
  clients: APP_ACCESS;
  users: APP_ACCESS;
  lawsuits: APP_ACCESS;
  payments: APP_ACCESS;
  folders: APP_ACCESS;
  events: APP_ACCESS;
  courts: APP_ACCESS;
  lawsuitStages: APP_ACCESS;
  lawsuitTypes: APP_ACCESS;
};

export type UserModelType = {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  password: string;
  role: USER_ROLES;
  userAccess: UserAccessType;
  cin: string | null;
  avatar: string | null;
  company: string;
  createdAt: string;
  createdBy: string;
  updatedBy: string;
  updatedAt: string;
  isDeleted: boolean;
};

export type CreateUserBodyRequest = Pick<
  UserModelType,
  "avatar" | "cin" | "email" | "fullName" | "password" | "phoneNumber" | "role"
> & {
  userAccess?: Partial<UserAccessType>;
};
export type UpdateUserBodyRequest = Pick<UserModelType, "_id"> & Pick<
  UserModelType,
  "avatar" | "cin" | "email" | "fullName" | "phoneNumber" | "role"
> & {
  userAccess?: Partial<UserAccessType>;
};
export type LoginBodyRequest = Pick<UserModelType, "email" | "password">;
export type ChangePasswordBodyRequest = {
  currentPassword: string;
  newPassword: string;
};
export type GetAllUsersQueryRequest = {
  search?: string;
  role?: USER_ROLES;
  limit: number;
  page: number;
};
export type UserByIdRequest = Pick<UserModelType, "_id">;

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

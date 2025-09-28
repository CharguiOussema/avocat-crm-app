import { UserModelType } from "./model";

export type CreateUserBodyRequest = Pick<
  UserModelType,
  "avatar" | "cin" | "email" | "fullName" | "password" | "roles" | "phoneNumber"
>;
export type UpdateUserBodyRequest = Pick<UserModelType, "_id"> &
  CreateUserBodyRequest;
export type LoginBodyRequest = Pick<UserModelType, "email" | "password">;
export type GetAllUsersQueryRequest = {
  search?: string;
  roles?: string;
  limit: number;
  page: number;
};
export type UserByIdRequest = Pick<UserModelType, "_id">;

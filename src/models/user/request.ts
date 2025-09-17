import { UserModelType } from "./model";

export type CreateUserBodyType = Pick<
  UserModelType,
  "avatar" | "cin" | "email" | "fullName" | "password" | "roles"
>;

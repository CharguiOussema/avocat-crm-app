import { USER_ROLES } from "../consts";

export type UserModelType = {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  password: string;
  roles: USER_ROLES[];
  cin: string | null;
  avatar: string | null;
  company: string;
  createdAt: string;
  createdBy: string;
  updatedBy: string;
  updatedAt: string;
  isDeleted: boolean;
};

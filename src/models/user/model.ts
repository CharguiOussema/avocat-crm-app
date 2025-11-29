import { USER_ROLES, APP_ACCESS } from "../consts";

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

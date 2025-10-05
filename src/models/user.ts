import { USER_ROLES } from './consts';

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

export type CreateUserBodyRequest = Pick<UserModelType, 'avatar' | 'cin' | 'email' | 'fullName' | 'password' | 'phoneNumber' | 'roles'>;
export type UpdateUserBodyRequest = Pick<UserModelType, '_id'> & CreateUserBodyRequest;
export type LoginBodyRequest = Pick<UserModelType, 'email' | 'password'>;
export type GetAllUsersQueryRequest = {
  search?: string;
  roles?: string;
  limit: number;
  page: number;
};
export type UserByIdRequest = Pick<UserModelType, '_id'>;

export type UserItemResponseType = Pick<
  UserModelType,
  '_id' | 'fullName' | 'avatar' | 'email' | 'phoneNumber' | 'cin' | 'roles' | 'createdAt' | 'updatedAt' | 'createdBy'
>;
export type UserLoginResponseType = { accessToken: string };

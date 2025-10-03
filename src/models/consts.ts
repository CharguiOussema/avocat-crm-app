export enum STATUS_CODE {
  OK = 200,
  BAD_REQUEST = 400,
  NOT_FOUND = 404,
  INTERNAL_SERVER = 500,
  UNAUTHORIZED = 401,
  DUPLICATED = 409,
  FORBIDDEN = 403,
  GONE = 410,
  EXPIRED = 498,
  NOT_ALLOWED = 405,
  LOCKED = 423,
}
export enum USER_ROLES {
  SUPER_ADMIN = "SUPER_ADMIN",
  USER_ADMIN = "USER_ADMIN",
  USER_AGENT = "USER_AGENT",
}
const ONE_MEGABYTE_IN_BYTES = 1024 * 1024;
// 100mb
export const MAX_FILE_UPLOAD_SIZE_IN_BYTES = ONE_MEGABYTE_IN_BYTES * 100;
export const ENVIRONMENTS = {
  development: "development",
  production: "production",
  staging: "staging",
} as const;

export type EnvironmentType = (typeof ENVIRONMENTS)[keyof typeof ENVIRONMENTS];
export enum ENVIRONMENT {
  LOCAL = "LOCAL",
  DEVELOPMENT = "DEVELOPMENT",
  PRODUCTION = "PRODUCTION",
}

export enum LEVELS {
  INFO = "INFO",
  WARNINIG = "WARNINIG",
  DEBUG = "DEBUG",
  ERROR = "ERROR",
}
//! user
export const BASIC_POPULATE_OBJECT = {
  createdBy: {
    path: "createdBy",
  },
};

export enum LAWSUIT_STATUS {
  DONE = "DONE",
  INPROGRESS = "INPROGRESS",
  SCHEDULED = "SCHEDULED",
  CANCELLED = "CANCELLED",
}

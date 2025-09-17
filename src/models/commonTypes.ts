import type { Query } from "express-serve-static-core";

export type CommonQueryParams = {
  page: number;
  limit: number;
  search?: string;
};

export type CommonQueryParamsWithFilter<
  TModel,
  Keys extends keyof TModel = keyof TModel,
> = Query &
  CommonQueryParams & {
    [key in Keys]: string | undefined;
  };
export type CommonQueryParamsWithoutPagination<
  TModel,
  Keys extends keyof TModel = keyof TModel,
> = Query & {
  [key in Keys]: string | undefined;
};
export type CouldBeNullable<T> = T | null;

export type CommonFilterItemResponseType = {
  label: string;
  value: string;
};

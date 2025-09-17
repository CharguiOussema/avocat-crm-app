import { Send } from "express-serve-static-core";

export type PaginationResponse<T> = {
  docs: T[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  nextPage: null | number;
  hasPrevPage: boolean;
  prevPage: null | number;
};
export type FilterType = { name: string; _id: string };

export type PartialNull<T> = {
  [P in keyof T]: T[P] | null;
};

export interface ResponseType<ResBody> extends Response {
  send: Send<ResBody, this>;
}

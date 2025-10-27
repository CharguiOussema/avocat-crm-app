/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 22/10/2025
 */

import { FolderModelType } from "./model";

export type FolderResponseType = Omit<FolderModelType, "isDeleted">;

export type FolderCreateResponseType = {
  folder: FolderResponseType;
  message: string;
};

export type FolderListResponseType = {
  folders: FolderResponseType[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type FolderTreeResponseType = FolderResponseType & {
  children?: FolderTreeResponseType[];
  files?: Array<{
    _id: string;
    originalName: string;
    fileSize: number;
    mimeType: string;
    category: string;
  }>;
};

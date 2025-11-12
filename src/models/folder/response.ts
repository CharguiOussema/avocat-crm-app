/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 22/10/2025
 */

import { FolderModelType } from "./model";
import { FileCategory, FileStatus } from "../file/model";

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

export type FolderTreeFileType = {
  _id: string;
  originalName: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  category: FileCategory;
  filePath: string;
  status: FileStatus;
  uploadedBy: string;
  storageType: string;
  isPublic: boolean;
  isDeleted: boolean;
  parent?: string;
  clientId?: string;
  lawsuitId?: string;
  company: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
};

export type FolderTreeResponseType = FolderResponseType & {
  children?: FolderTreeResponseType[];
  files?: FolderTreeFileType[];
};

export type FolderTreeWithRootFilesResponseType = {
  folders: FolderTreeResponseType[];
  rootFiles: FolderTreeFileType[];
};

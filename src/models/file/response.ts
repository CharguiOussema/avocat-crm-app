/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 22/9/2024
 */

import { FileModelType } from "./model";

export type FileResponseType = Omit<FileModelType, "isDeleted">;

export type FileUploadResponseType = {
  file: FileResponseType;
  message: string;
};

export type FileListResponseType = {
  files: FileResponseType[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type FileDownloadResponseType = {
  fileName: string;
  mimeType: string;
  fileSize: number;
  buffer: Buffer;
};

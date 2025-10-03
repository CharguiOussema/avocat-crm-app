/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 22/9/2024
 */

export enum FileCategory {
  DOCUMENT = "document",
  IMAGE = "image",
  AUDIO = "audio",
  VIDEO = "video",
  OTHER = "other",
}

export enum FileStatus {
  UPLOADING = "uploading",
  PROCESSING = "processing",
  READY = "ready",
  ERROR = "error",
}

export type FileModelType = {
  _id: string;
  originalName: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
  category: FileCategory;
  status: FileStatus;
  uploadedBy: string;
  associatedEntity?: string;
  associatedEntityType?: string;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    pages?: number;
    format?: string;
    channels?: number;
    bitrate?: number;
    [key: string]: string | number | boolean | undefined;
  };
  checksum?: string;
  storageType: string;
  isPublic: boolean;
  company: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  isDeleted: boolean;
};

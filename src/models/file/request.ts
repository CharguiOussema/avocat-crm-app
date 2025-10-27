/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 22/9/2024
 */

import { FileCategory } from "./model";

export type FileUploadRequestType = {
  originalName: string;
  category?: FileCategory;
  associatedEntity?: string;
  associatedEntityType?: string;
  isPublic?: boolean;
  parent?: string;
  clientId?: string;
  lawsuitId?: string;
};

export type FileUpdateRequestType = {
  originalName?: string;
  category?: FileCategory;
  associatedEntity?: string;
  associatedEntityType?: string;
  isPublic?: boolean;
  parent?: string;
  clientId?: string;
  lawsuitId?: string;
};

export type FileQueryRequestType = {
  category?: FileCategory;
  associatedEntity?: string;
  associatedEntityType?: string;
  mimeType?: string;
  uploadedBy?: string;
  isPublic?: boolean;
  status?: string;
  parent?: string;
  clientId?: string;
  lawsuitId?: string;
};

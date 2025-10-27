/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 22/10/2025
 */

export type FolderCreateRequestType = {
  name: string;
  parent?: string;
  clientId?: string;
  lawsuitId?: string;
};

export type FolderUpdateRequestType = {
  name?: string;
  parent?: string;
  clientId?: string;
  lawsuitId?: string;
};

export type FolderQueryRequestType = {
  name?: string;
  parent?: string;
  clientId?: string;
  lawsuitId?: string;
  search?: string;
};

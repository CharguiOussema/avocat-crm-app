/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 22/10/2025
 */

export type FolderModelType = {
  _id: string;
  name: string;
  parent?: string;
  clientId?: string;
  lawsuitId?: string;
  size: number;
  company: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  isDeleted: boolean;
};

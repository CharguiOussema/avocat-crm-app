/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 22/10/2025
 */

export class FolderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FolderError";
  }
}

export class FolderNotFoundError extends FolderError {
  constructor(folderId: string) {
    super(`Folder with ID ${folderId} not found`);
    this.name = "FolderNotFoundError";
  }
}

export class FolderAlreadyExistsError extends FolderError {
  constructor(folderName: string) {
    super(`Folder with name ${folderName} already exists in this location`);
    this.name = "FolderAlreadyExistsError";
  }
}

export class CircularReferenceError extends FolderError {
  constructor() {
    super("Cannot move folder: circular reference detected");
    this.name = "CircularReferenceError";
  }
}

export class FolderNotEmptyError extends FolderError {
  constructor(folderId: string) {
    super(`Folder ${folderId} is not empty and cannot be deleted`);
    this.name = "FolderNotEmptyError";
  }
}

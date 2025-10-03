/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 22/9/2024
 */

export class FileUploadError extends Error {
  constructor(
    message: string,
    public readonly code: string = "FILE_UPLOAD_ERROR",
  ) {
    super(message);
    this.name = "FileUploadError";
  }
}

export class FileSizeExceededError extends FileUploadError {
  constructor(size: number, maxSize: number) {
    super(
      `File size ${size} exceeds maximum allowed size of ${maxSize}`,
      "FILE_SIZE_EXCEEDED",
    );
    this.name = "FileSizeExceededError";
  }
}

export class FileTypeNotAllowedError extends FileUploadError {
  constructor(mimeType: string) {
    super(`File type ${mimeType} is not allowed`, "FILE_TYPE_NOT_ALLOWED");
    this.name = "FileTypeNotAllowedError";
  }
}

export class FileExtensionNotAllowedError extends FileUploadError {
  constructor(extension: string) {
    super(
      `File extension ${extension} is not allowed`,
      "FILE_EXTENSION_NOT_ALLOWED",
    );
    this.name = "FileExtensionNotAllowedError";
  }
}

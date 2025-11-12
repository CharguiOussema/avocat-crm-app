/**
 * File utility functions for the frontend
 */

// File extension to icon mapping
export const FILE_EXTENSION_ICONS: Record<string, { icon: string; color: string }> = {
  // Images
  '.jpg': { icon: 'FileImage', color: 'text-purple-500' },
  '.jpeg': { icon: 'FileImage', color: 'text-purple-500' },
  '.png': { icon: 'FileImage', color: 'text-purple-500' },
  '.gif': { icon: 'FileImage', color: 'text-purple-500' },
  '.webp': { icon: 'FileImage', color: 'text-purple-500' },
  '.svg': { icon: 'FileImage', color: 'text-purple-500' },
  '.bmp': { icon: 'FileImage', color: 'text-purple-500' },
  '.tiff': { icon: 'FileImage', color: 'text-purple-500' },
  '.tif': { icon: 'FileImage', color: 'text-purple-500' },
  '.ico': { icon: 'FileImage', color: 'text-purple-500' },

  // Documents - PDF
  '.pdf': { icon: 'FileText', color: 'text-red-500' },

  // Documents - Word
  '.doc': { icon: 'FileText', color: 'text-blue-500' },
  '.docx': { icon: 'FileText', color: 'text-blue-500' },
  '.odt': { icon: 'FileText', color: 'text-blue-500' },
  '.rtf': { icon: 'FileText', color: 'text-blue-500' },

  // Documents - Excel
  '.xls': { icon: 'FileSpreadsheet', color: 'text-green-500' },
  '.xlsx': { icon: 'FileSpreadsheet', color: 'text-green-500' },
  '.ods': { icon: 'FileSpreadsheet', color: 'text-green-500' },
  '.csv': { icon: 'FileSpreadsheet', color: 'text-green-500' },

  // Documents - PowerPoint
  '.ppt': { icon: 'Presentation', color: 'text-orange-500' },
  '.pptx': { icon: 'Presentation', color: 'text-orange-500' },
  '.odp': { icon: 'Presentation', color: 'text-orange-500' },

  // Text
  '.txt': { icon: 'FileText', color: 'text-gray-500' },

  // Archives
  '.zip': { icon: 'FileArchive', color: 'text-yellow-600' },
  '.rar': { icon: 'FileArchive', color: 'text-yellow-600' },
  '.7z': { icon: 'FileArchive', color: 'text-yellow-600' },
  '.tar': { icon: 'FileArchive', color: 'text-yellow-600' },
  '.gz': { icon: 'FileArchive', color: 'text-yellow-600' },

  // Audio
  '.mp3': { icon: 'FileAudio', color: 'text-pink-500' },
  '.wav': { icon: 'FileAudio', color: 'text-pink-500' },
  '.ogg': { icon: 'FileAudio', color: 'text-pink-500' },
  '.flac': { icon: 'FileAudio', color: 'text-pink-500' },
  '.aac': { icon: 'FileAudio', color: 'text-pink-500' },
  '.m4a': { icon: 'FileAudio', color: 'text-pink-500' },
  '.wma': { icon: 'FileAudio', color: 'text-pink-500' },

  // Video
  '.mp4': { icon: 'FileVideo', color: 'text-indigo-500' },
  '.mpeg': { icon: 'FileVideo', color: 'text-indigo-500' },
  '.mpg': { icon: 'FileVideo', color: 'text-indigo-500' },
  '.avi': { icon: 'FileVideo', color: 'text-indigo-500' },
  '.mov': { icon: 'FileVideo', color: 'text-indigo-500' },
  '.wmv': { icon: 'FileVideo', color: 'text-indigo-500' },
  '.flv': { icon: 'FileVideo', color: 'text-indigo-500' },
  '.webm': { icon: 'FileVideo', color: 'text-indigo-500' },
  '.mkv': { icon: 'FileVideo', color: 'text-indigo-500' },
};

// Default icon for unknown file types
export const DEFAULT_FILE_ICON = { icon: 'File', color: 'text-gray-400' };

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex === -1) return '';
  return filename.substring(lastDotIndex).toLowerCase();
}

/**
 * Get file icon and color based on extension
 */
export function getFileIcon(filename: string): { icon: string; color: string } {
  const extension = getFileExtension(filename);
  return FILE_EXTENSION_ICONS[extension] || DEFAULT_FILE_ICON;
}

/**
 * Check if file is an image based on extension
 */
export function isImageFile(filename: string): boolean {
  const extension = getFileExtension(filename);
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.tiff', '.tif', '.ico'];
  return imageExtensions.includes(extension);
}

/**
 * Check if file is a document based on extension
 */
export function isDocumentFile(filename: string): boolean {
  const extension = getFileExtension(filename);
  const documentExtensions = [
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
    '.odt', '.ods', '.odp', '.rtf', '.txt', '.csv'
  ];
  return documentExtensions.includes(extension);
}

/**
 * Check if file is audio based on extension
 */
export function isAudioFile(filename: string): boolean {
  const extension = getFileExtension(filename);
  const audioExtensions = ['.mp3', '.wav', '.ogg', '.flac', '.aac', '.m4a', '.wma'];
  return audioExtensions.includes(extension);
}

/**
 * Check if file is video based on extension
 */
export function isVideoFile(filename: string): boolean {
  const extension = getFileExtension(filename);
  const videoExtensions = ['.mp4', '.mpeg', '.mpg', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv'];
  return videoExtensions.includes(extension);
}

/**
 * Check if file is an archive based on extension
 */
export function isArchiveFile(filename: string): boolean {
  const extension = getFileExtension(filename);
  const archiveExtensions = ['.zip', '.rar', '.7z', '.tar', '.gz'];
  return archiveExtensions.includes(extension);
}

/**
 * Check if file type supports preview
 */
export function isPreviewSupported(filename: string): boolean {
  return isImageFile(filename) || filename.toLowerCase().endsWith('.pdf');
}

/**
 * Validate file size against a maximum
 */
export function validateFileSize(file: File, maxSizeInBytes: number): { valid: boolean; error?: string } {
  if (file.size > maxSizeInBytes) {
    return {
      valid: false,
      error: `File size (${formatFileSize(file.size)}) exceeds maximum allowed size (${formatFileSize(maxSizeInBytes)})`
    };
  }
  return { valid: true };
}

/**
 * Validate file type against allowed types
 */
export function validateFileType(file: File, allowedTypes: string[]): { valid: boolean; error?: string } {
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type "${file.type}" is not allowed`
    };
  }
  return { valid: true };
}

/**
 * Validate file extension against allowed extensions
 */
export function validateFileExtension(filename: string, allowedExtensions: string[]): { valid: boolean; error?: string } {
  const extension = getFileExtension(filename);
  if (!allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: `File extension "${extension}" is not allowed`
    };
  }
  return { valid: true };
}

/**
 * Comprehensive file validation
 */
export interface FileValidationOptions {
  maxSize?: number;
  allowedTypes?: string[];
  allowedExtensions?: string[];
}

export interface FileValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateFile(file: File, options: FileValidationOptions = {}): FileValidationResult {
  const errors: string[] = [];

  // Validate file size
  if (options.maxSize) {
    const sizeResult = validateFileSize(file, options.maxSize);
    if (!sizeResult.valid && sizeResult.error) {
      errors.push(sizeResult.error);
    }
  }

  // Validate file type
  if (options.allowedTypes && options.allowedTypes.length > 0) {
    const typeResult = validateFileType(file, options.allowedTypes);
    if (!typeResult.valid && typeResult.error) {
      errors.push(typeResult.error);
    }
  }

  // Validate file extension
  if (options.allowedExtensions && options.allowedExtensions.length > 0) {
    const extensionResult = validateFileExtension(file.name, options.allowedExtensions);
    if (!extensionResult.valid && extensionResult.error) {
      errors.push(extensionResult.error);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get file type category
 */
export function getFileCategory(filename: string): 'image' | 'document' | 'audio' | 'video' | 'archive' | 'other' {
  if (isImageFile(filename)) return 'image';
  if (isDocumentFile(filename)) return 'document';
  if (isAudioFile(filename)) return 'audio';
  if (isVideoFile(filename)) return 'video';
  if (isArchiveFile(filename)) return 'archive';
  return 'other';
}

/**
 * Download file from blob
 */
export function downloadFile(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Convert File to Base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Get file name without extension
 */
export function getFileNameWithoutExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex === -1) return filename;
  return filename.substring(0, lastDotIndex);
}

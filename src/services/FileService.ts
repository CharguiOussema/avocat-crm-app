/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 22/9/2024
 */

import { apiService } from './api';
import { API_URL } from '../constants';

export interface FileUploadData {
  category?: 'document' | 'image' | 'audio' | 'video' | 'other';
  associatedEntity?: string;
  associatedEntityType?: string;
  isPublic?: boolean;
  parent?: string;
  clientId?: string;
  lawsuitId?: string;
}

export interface FileModel {
  _id: string;
  originalName: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
  category: 'document' | 'image' | 'audio' | 'video' | 'other';
  status: 'uploading' | 'processing' | 'ready' | 'error';
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
}

export interface FileListResponse {
  files: FileModel[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FileQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: 'document' | 'image' | 'audio' | 'video' | 'other';
  associatedEntity?: string;
  associatedEntityType?: string;
  mimeType?: string;
  uploadedBy?: string;
  isPublic?: boolean;
  status?: string;
}

export interface StorageConfig {
  maxFileSize: number;
  allowedMimeTypes: string[];
  allowedExtensions: string[];
  fileServeUrl: string;
}

export class FileService {
  private static instance: FileService;
  private storageConfig: StorageConfig | null = null;

  public static getInstance(): FileService {
    if (!FileService.instance) {
      FileService.instance = new FileService();
    }
    return FileService.instance;
  }

  /**
   * Get storage configuration from backend
   */
  async getStorageConfig(): Promise<StorageConfig> {
    if (this.storageConfig) {
      return this.storageConfig;
    }

    this.storageConfig = await apiService.request<StorageConfig>(
      'GET',
      '/files/config',
      undefined,
      { skipAuth: true }
    );

    return this.storageConfig;
  }

  /**
   * Upload a file to the server
   */
  async uploadFile(file: File, data?: FileUploadData): Promise<FileModel> {
    const formData = new FormData();
    formData.append('file', file);

    if (data?.category) {
      formData.append('category', data.category);
    }
    if (data?.associatedEntity) {
      formData.append('associatedEntity', data.associatedEntity);
    }
    if (data?.associatedEntityType) {
      formData.append('associatedEntityType', data.associatedEntityType);
    }
    if (data?.isPublic !== undefined) {
      formData.append('isPublic', data.isPublic.toString());
    }
    if (data?.parent) {
      formData.append('parent', data.parent);
    }
    if (data?.clientId) {
      formData.append('clientId', data.clientId);
    }
    if (data?.lawsuitId) {
      formData.append('lawsuitId', data.lawsuitId);
    }

    return await apiService.request<FileModel>(
      'POST',
      '/files/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  }

  /**
   * Get all files with optional filtering
   */
  async getFiles(params?: FileQueryParams): Promise<FileListResponse> {
    return await apiService.request<FileListResponse>(
      'GET',
      '/files',
      undefined,
      { params }
    );
  }

  /**
   * Get a specific file by ID
   */
  async getFileById(id: string): Promise<FileModel> {
    return await apiService.request<FileModel>(
      'GET',
      `/files/${id}`
    );
  }

  /**
   * Update file metadata
   */
  async updateFile(id: string, data: Partial<FileUploadData>): Promise<FileModel> {
    return await apiService.request<FileModel>(
      'PUT',
      `/files/${id}`,
      data
    );
  }

  /**
   * Delete a file (soft delete)
   */
  async deleteFile(id: string): Promise<void> {
    await apiService.request<{ message: string }>(
      'DELETE',
      `/files/${id}`
    );
  }

  /**
   * Get the URL for displaying/downloading a file
   */
  getFileUrl(fileName: string): string {
    if (this.storageConfig?.fileServeUrl) {
      return `${this.storageConfig.fileServeUrl}/${fileName}`;
    }
    return `${API_URL}/api/files/serve/${fileName}`;
  }

  /**
   * Get the download URL for a file
   */
  getDownloadUrl(fileName: string): string {
    return `${API_URL}/api/files/download/${fileName}`;
  }

  /**
   * Download a file as blob
   */
  async downloadFile(fileName: string): Promise<Blob> {
    return await apiService.request<Blob>(
      'GET',
      `/files/download/${fileName}`,
      undefined,
      { responseType: 'blob' }
    );
  }

  /**
   * Check if a file is an image based on its MIME type
   */
  isImage(file: FileModel): boolean {
    return file.mimeType.startsWith('image/');
  }

  /**
   * Check if a file is a document
   */
  isDocument(file: FileModel): boolean {
    return file.category === 'document';
  }

  /**
   * Check if a file is audio
   */
  isAudio(file: FileModel): boolean {
    return file.mimeType.startsWith('audio/');
  }

  /**
   * Check if a file is video
   */
  isVideo(file: FileModel): boolean {
    return file.mimeType.startsWith('video/');
  }

  /**
   * Format file size to human readable format
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get file icon based on file type
   */
  getFileIcon(file: FileModel): string {
    if (this.isImage(file)) return '🖼️';
    if (this.isDocument(file)) return '📄';
    if (this.isAudio(file)) return '🎵';
    if (this.isVideo(file)) return '🎥';
    return '📁';
  }

  /**
   * Validate file before upload
   */
  async validateFile(file: File, options?: {
    maxSize?: number;
    allowedTypes?: string[];
    allowedExtensions?: string[];
  }): Promise<{ valid: boolean; error?: string }> {
    // Use provided options or fallback to server config
    let maxSize = options?.maxSize;
    let allowedTypes = options?.allowedTypes;
    let allowedExtensions = options?.allowedExtensions;

    if (!maxSize || !allowedTypes || !allowedExtensions) {
      const config = await this.getStorageConfig();
      maxSize = maxSize || config.maxFileSize;
      allowedTypes = allowedTypes || config.allowedMimeTypes;
      allowedExtensions = allowedExtensions || config.allowedExtensions;
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size exceeds maximum allowed size of ${this.formatFileSize(maxSize)}`
      };
    }

    if (allowedTypes && !allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'File type not allowed'
      };
    }

    if (allowedExtensions) {
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!allowedExtensions.includes(fileExtension)) {
        return {
          valid: false,
          error: 'File extension not allowed'
        };
      }
    }

    return { valid: true };
  }
}

export const fileService = FileService.getInstance();
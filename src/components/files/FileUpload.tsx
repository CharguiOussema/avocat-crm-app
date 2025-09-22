/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 22/9/2024
 */

import React, { useState, useCallback } from 'react';
import { Upload, X, FileText, Image, Music, Video, File } from 'lucide-react';
import { fileService, type FileUploadData, type FileModel } from '../../services';

interface FileUploadProps {
  onUploadSuccess?: (file: FileModel) => void;
  onUploadError?: (error: string) => void;
  uploadData?: FileUploadData;
  maxFileSize?: number;
  allowedTypes?: string[];
  allowedExtensions?: string[];
  multiple?: boolean;
  className?: string;
  disabled?: boolean;
}

interface UploadProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
  uploadedFile?: FileModel;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onUploadSuccess,
  onUploadError,
  uploadData,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  allowedTypes,
  allowedExtensions,
  multiple = false,
  className = '',
  disabled = false,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploads, setUploads] = useState<UploadProgress[]>([]);

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (file.type.startsWith('audio/')) return <Music className="w-4 h-4" />;
    if (file.type.startsWith('video/')) return <Video className="w-4 h-4" />;
    if (file.type === 'application/pdf' || file.type.includes('document')) return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const validateAndUploadFiles = useCallback(async (files: FileList) => {
    const filesToUpload = Array.from(files);

    for (const file of filesToUpload) {
      const validation = await fileService.validateFile(file, {
        maxSize: maxFileSize,
        allowedTypes,
        allowedExtensions,
      });

      if (!validation.valid) {
        onUploadError?.(validation.error || 'File validation failed');
        continue;
      }

      const uploadProgress: UploadProgress = {
        file,
        progress: 0,
        status: 'uploading',
      };

      setUploads(prev => [...prev, uploadProgress]);

      try {
        uploadProgress.progress = 50;
        setUploads(prev => prev.map(u => u.file === file ? { ...u, progress: 50 } : u));

        const uploadedFile = await fileService.uploadFile(file, uploadData);

        uploadProgress.progress = 100;
        uploadProgress.status = 'success';
        uploadProgress.uploadedFile = uploadedFile;

        setUploads(prev => prev.map(u => u.file === file ? uploadProgress : u));

        onUploadSuccess?.(uploadedFile);

        setTimeout(() => {
          setUploads(prev => prev.filter(u => u.file !== file));
        }, 3000);

      } catch (error) {
        uploadProgress.status = 'error';
        uploadProgress.error = error instanceof Error ? error.message : 'Upload failed';

        setUploads(prev => prev.map(u => u.file === file ? uploadProgress : u));

        onUploadError?.(uploadProgress.error);

        setTimeout(() => {
          setUploads(prev => prev.filter(u => u.file !== file));
        }, 5000);
      }
    }
  }, [maxFileSize, allowedTypes, allowedExtensions, uploadData, onUploadSuccess, onUploadError]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndUploadFiles(e.dataTransfer.files);
    }
  }, [disabled, validateAndUploadFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.target.files && e.target.files[0]) {
      validateAndUploadFiles(e.target.files);
    }
  }, [disabled, validateAndUploadFiles]);

  const removeUpload = useCallback((file: File) => {
    setUploads(prev => prev.filter(u => u.file !== file));
  }, []);

  return (
    <div className={`w-full ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center
          transition-colors duration-200 ease-in-out
          ${dragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 bg-gray-50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && document.getElementById('file-upload')?.click()}
      >
        <input
          id="file-upload"
          type="file"
          multiple={multiple}
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
          accept={allowedTypes?.join(',')}
        />

        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />

        <div className="text-sm text-gray-600">
          <span className="font-medium text-blue-600 hover:text-blue-500">
            Click to upload
          </span>
          {' '}or drag and drop
        </div>

        <p className="text-xs text-gray-500 mt-2">
          Max file size: {fileService.formatFileSize(maxFileSize)}
        </p>
      </div>

      {/* Upload Progress */}
      {uploads.length > 0 && (
        <div className="mt-4 space-y-2">
          {uploads.map((upload, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-white border rounded-lg">
              {getFileIcon(upload.file)}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {upload.file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {fileService.formatFileSize(upload.file.size)}
                </p>
              </div>

              {upload.status === 'uploading' && (
                <div className="flex-1 max-w-32">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${upload.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {upload.status === 'success' && (
                <div className="text-green-500 text-xs font-medium">
                  ✓ Uploaded
                </div>
              )}

              {upload.status === 'error' && (
                <div className="text-red-500 text-xs font-medium">
                  ✗ {upload.error}
                </div>
              )}

              <button
                onClick={() => removeUpload(upload.file)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
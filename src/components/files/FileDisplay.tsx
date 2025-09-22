/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 22/9/2024
 */

import React from 'react';
import { Download, Eye, Trash2, Edit, FileText, Image, Music, Video, File } from 'lucide-react';
import { fileService, type FileModel } from '../../services';

interface FileDisplayProps {
  file: FileModel;
  onDownload?: (file: FileModel) => void;
  onView?: (file: FileModel) => void;
  onEdit?: (file: FileModel) => void;
  onDelete?: (file: FileModel) => void;
  showActions?: boolean;
  compact?: boolean;
  className?: string;
}

export const FileDisplay: React.FC<FileDisplayProps> = ({
  file,
  onDownload,
  onView,
  onEdit,
  onDelete,
  showActions = true,
  compact = false,
  className = '',
}) => {
  const getFileIcon = () => {
    if (fileService.isImage(file)) return <Image className="w-5 h-5 text-blue-500" />;
    if (fileService.isAudio(file)) return <Music className="w-5 h-5 text-purple-500" />;
    if (fileService.isVideo(file)) return <Video className="w-5 h-5 text-red-500" />;
    if (fileService.isDocument(file)) return <FileText className="w-5 h-5 text-green-500" />;
    return <File className="w-5 h-5 text-gray-500" />;
  };

  const getStatusColor = () => {
    switch (file.status) {
      case 'ready': return 'text-green-600 bg-green-100';
      case 'processing': return 'text-yellow-600 bg-yellow-100';
      case 'uploading': return 'text-blue-600 bg-blue-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload(file);
    } else {
      window.open(fileService.getDownloadUrl(file.fileName), '_blank');
    }
  };

  const handleView = () => {
    if (onView) {
      onView(file);
    } else {
      window.open(fileService.getFileUrl(file.fileName), '_blank');
    }
  };

  if (compact) {
    return (
      <div className={`flex items-center space-x-3 p-2 hover:bg-gray-50 rounded ${className}`}>
        {getFileIcon()}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {file.originalName}
          </p>
          <p className="text-xs text-gray-500">
            {fileService.formatFileSize(file.fileSize)}
          </p>
        </div>
        {showActions && (
          <div className="flex space-x-1">
            <button
              onClick={handleView}
              className="p-1 text-gray-400 hover:text-blue-500"
              title="View"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownload}
              className="p-1 text-gray-400 hover:text-green-500"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white border rounded-lg p-4 hover:shadow-md transition-shadow ${className}`}>
      {/* File Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          {getFileIcon()}
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {file.originalName}
            </h3>
            <p className="text-xs text-gray-500">
              {fileService.formatFileSize(file.fileSize)} • {file.mimeType}
            </p>
          </div>
        </div>

        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
          {file.status}
        </span>
      </div>

      {/* File Preview */}
      {fileService.isImage(file) && (
        <div className="mb-3">
          <img
            src={fileService.getFileUrl(file.fileName)}
            alt={file.originalName}
            className="w-full h-32 object-cover rounded border"
            loading="lazy"
          />
        </div>
      )}

      {/* File Metadata */}
      <div className="text-xs text-gray-500 space-y-1 mb-3">
        <div>Uploaded: {new Date(file.createdAt).toLocaleDateString()}</div>
        {file.associatedEntity && (
          <div>Associated: {file.associatedEntityType} #{file.associatedEntity}</div>
        )}
        {file.metadata && Object.keys(file.metadata).length > 0 && (
          <div className="flex flex-wrap gap-1">
            {file.metadata.width && file.metadata.height && (
              <span className="bg-gray-100 px-1 rounded">
                {file.metadata.width}×{file.metadata.height}
              </span>
            )}
            {file.metadata.duration && (
              <span className="bg-gray-100 px-1 rounded">
                {Math.round(file.metadata.duration)}s
              </span>
            )}
            {file.metadata.pages && (
              <span className="bg-gray-100 px-1 rounded">
                {file.metadata.pages} pages
              </span>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex space-x-2">
            <button
              onClick={handleView}
              className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              <Eye className="w-3 h-3 mr-1" />
              View
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center px-3 py-1 text-xs font-medium text-green-600 hover:text-green-700"
            >
              <Download className="w-3 h-3 mr-1" />
              Download
            </button>
          </div>

          <div className="flex space-x-2">
            {onEdit && (
              <button
                onClick={() => onEdit(file)}
                className="p-1 text-gray-400 hover:text-blue-500"
                title="Edit"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(file)}
                className="p-1 text-gray-400 hover:text-red-500"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
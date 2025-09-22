/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 22/9/2024
 */

import React, { useState, useEffect } from 'react';
import { Search, Filter, Grid, List, Plus } from 'lucide-react';
import { fileService, type FileModel, type FileQueryParams, type FileUploadData } from '../../services';
import { FileUpload } from './FileUpload';
import { FileDisplay } from './FileDisplay';

interface FileManagerProps {
  associatedEntity?: string;
  associatedEntityType?: string;
  defaultCategory?: 'document' | 'image' | 'audio' | 'video' | 'other';
  showUpload?: boolean;
  className?: string;
}

export const FileManager: React.FC<FileManagerProps> = ({
  associatedEntity,
  associatedEntityType,
  defaultCategory,
  showUpload = true,
  className = '',
}) => {
  const [files, setFiles] = useState<FileModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUploadArea, setShowUploadArea] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'document' | 'image' | 'audio' | 'video' | 'other'>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const categories: Array<{
    value: 'all' | 'document' | 'image' | 'audio' | 'video' | 'other';
    label: string;
  }> = [
    { value: 'all', label: 'All Files' },
    { value: 'document', label: 'Documents' },
    { value: 'image', label: 'Images' },
    { value: 'audio', label: 'Audio' },
    { value: 'video', label: 'Video' },
    { value: 'other', label: 'Other' },
  ] as const;

  const fetchFiles = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: FileQueryParams = {
        page,
        limit: 12,
        ...(searchTerm && { search: searchTerm }),
        ...(filterCategory !== 'all' && {
          category: filterCategory as 'document' | 'image' | 'audio' | 'video' | 'other'
        }),
        ...(associatedEntity && { associatedEntity }),
        ...(associatedEntityType && { associatedEntityType }),
      };

      const response = await fileService.getFiles(params);
      setFiles(response.files);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch files');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [page, searchTerm, filterCategory, associatedEntity, associatedEntityType]);

  const handleUploadSuccess = (file: FileModel) => {
    setFiles(prev => [file, ...prev]);
    setShowUploadArea(false);
  };

  const handleUploadError = (error: string) => {
    setError(error);
  };

  const handleDeleteFile = async (file: FileModel) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      await fileService.deleteFile(file._id);
      setFiles(prev => prev.filter(f => f._id !== file._id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete file');
    }
  };

  const uploadData: FileUploadData = {
    ...(defaultCategory && { category: defaultCategory }),
    ...(associatedEntity && { associatedEntity }),
    ...(associatedEntityType && { associatedEntityType }),
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          File Manager
          {files.length > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({files.length} files)
            </span>
          )}
        </h2>

        <div className="flex items-center space-x-2">
          {showUpload && (
            <button
              onClick={() => setShowUploadArea(!showUploadArea)}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="w-4 h-4 mr-1" />
              Upload
            </button>
          )}

          <div className="flex border rounded-md">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              title="Grid view"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      {showUpload && showUploadArea && (
        <div className="mb-6">
          <FileUpload
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
            uploadData={uploadData}
            multiple={true}
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as typeof filterCategory)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 border border-red-300 rounded-md bg-red-50">
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-xs text-red-600 hover:text-red-800"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Empty State */}
      {!loading && files.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            📁
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No files</h3>
          <p className="mt-1 text-sm text-gray-500">
            {showUpload ? 'Get started by uploading a file.' : 'No files found.'}
          </p>
        </div>
      )}

      {/* Files Grid/List */}
      {!loading && files.length > 0 && (
        <>
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'space-y-2'
          }>
            {files.map(file => (
              <FileDisplay
                key={file._id}
                file={file}
                onDelete={handleDeleteFile}
                compact={viewMode === 'list'}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
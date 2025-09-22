/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 22/9/2024
 */

import React, { useState, useRef, useEffect } from 'react';
import { Avatar } from './Avatar';
import { avatarService, type AvatarEntity } from '../../services/AvatarService';

interface AvatarUploadProps {
  entity?: AvatarEntity; // For update mode with existing entity
  entityType: string;
  onAvatarSelected?: (file: File | null) => void;
  disabled?: boolean;
  className?: string;
  useTailwind?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  entity,
  entityType,
  onAvatarSelected,
  disabled = false,
  className = '',
  useTailwind = true,
  size = 'large'
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Create a temporary entity for preview when no entity exists (create mode)
  const displayEntity: AvatarEntity = entity || {
    _id: 'temp',
    avatar: null,
    fullName: 'New Avatar'
  };

  // Use preview URL if file is selected, otherwise use existing avatar
  const previewEntity: AvatarEntity = {
    ...displayEntity,
    avatar: previewUrl || displayEntity.avatar
  };

  // Cleanup preview URL on unmount or when file changes
  useEffect(() => {
    return () => {
      if (previewUrl) {
        avatarService.cleanupPreviewUrl(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError(null);

    // Clear previous preview
    if (previewUrl) {
      avatarService.cleanupPreviewUrl(previewUrl);
      setPreviewUrl(null);
    }

    if (!file) {
      setSelectedFile(null);
      onAvatarSelected?.(null);
      return;
    }

    // Validate file
    const validation = avatarService.validateAvatarFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      setSelectedFile(null);
      onAvatarSelected?.(null);
      return;
    }

    // Create preview
    const preview = avatarService.createPreviewUrl(file);
    setPreviewUrl(preview);
    setSelectedFile(file);
    onAvatarSelected?.(file);
  };

  const triggerFileSelect = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const clearAvatar = () => {
    if (!disabled) {
      if (previewUrl) {
        avatarService.cleanupPreviewUrl(previewUrl);
        setPreviewUrl(null);
      }
      setSelectedFile(null);
      setError(null);
      onAvatarSelected?.(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const containerStyles: React.CSSProperties = useTailwind
    ? {}
    : {
        display: 'inline-block',
        position: 'relative'
      };

  const containerClasses = useTailwind
    ? 'avatar-upload-container relative inline-block'
    : '';

  const buttonBaseStyles: React.CSSProperties = useTailwind
    ? {}
    : {
        position: 'absolute',
        bottom: '0',
        right: '0',
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        backgroundColor: '#3b82f6',
        color: 'white',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1
      };

  const buttonClasses = useTailwind
    ? `absolute bottom-0 right-0 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-blue-600 ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`
    : '';

  const actionButtonStyles: React.CSSProperties = useTailwind
    ? {}
    : {
        padding: '6px 12px',
        margin: '4px',
        border: 'none',
        borderRadius: '4px',
        fontSize: '14px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1
      };

  return (
    <div className={`avatar-upload ${className}`}>
      <div
        className={containerClasses}
        style={containerStyles}
      >
        {/* Avatar Display */}
        <Avatar
          entity={previewEntity}
          entityType={entityType}
          size={size}
          useTailwind={useTailwind}
          onClick={disabled ? undefined : triggerFileSelect}
        />

        {/* Upload Button Overlay */}
        {!disabled && (
          <button
            type="button"
            onClick={triggerFileSelect}
            className={buttonClasses}
            style={buttonBaseStyles}
            title="Upload avatar"
          >
            📷
          </button>
        )}
      </div>

      {/* Action Buttons */}
      {!disabled && (
        <div
          className={useTailwind ? 'avatar-actions mt-2 flex gap-2' : ''}
          style={useTailwind ? {} : { marginTop: '8px', display: 'flex', gap: '8px' }}
        >
          <button
            type="button"
            onClick={triggerFileSelect}
            className={useTailwind ? 'px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600' : ''}
            style={useTailwind ? {} : { ...actionButtonStyles, backgroundColor: '#3b82f6', color: 'white' }}
          >
            {selectedFile || displayEntity.avatar ? 'Change' : 'Upload'}
          </button>

          {(selectedFile || displayEntity.avatar) && (
            <button
              type="button"
              onClick={clearAvatar}
              className={useTailwind ? 'px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600' : ''}
              style={useTailwind ? {} : { ...actionButtonStyles, backgroundColor: '#ef4444', color: 'white' }}
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div
          className={useTailwind ? 'error-message mt-2 text-red-500 text-sm' : ''}
          style={useTailwind ? {} : { marginTop: '8px', fontSize: '14px', color: '#ef4444' }}
        >
          {error}
        </div>
      )}

      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        disabled={disabled}
      />
    </div>
  );
};
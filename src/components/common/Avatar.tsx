/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 22/9/2024
 */

import React, { useState } from 'react';
import { avatarService, type AvatarEntity, type AvatarSize } from '../../services/AvatarService';

interface AvatarProps {
  entity: AvatarEntity;
  entityType: string;
  size?: AvatarSize;
  className?: string;
  style?: React.CSSProperties;
  showFallback?: boolean;
  onClick?: () => void;
  useTailwind?: boolean; // Whether to use Tailwind classes or inline styles
}

export const Avatar: React.FC<AvatarProps> = ({
  entity,
  entityType,
  size = 'medium',
  className = '',
  style = {},
  showFallback = true,
  onClick,
  useTailwind = true
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const hasAvatar = avatarService.hasAvatar(entity) && !imageError;
  const isClickable = Boolean(onClick);


  // Get size styles based on preference
  const sizeStyles = useTailwind
    ? {}
    : avatarService.getSizeStyles(size);

  const sizeClasses = useTailwind
    ? avatarService.getSizeClasses(size)
    : '';

  // Combine all styles
  const baseStyles: React.CSSProperties = {
    borderRadius: '50%',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    border: '2px solid #d1d5db',
    cursor: isClickable ? 'pointer' : 'default',
    ...sizeStyles,
    ...style
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    console.warn(`Failed to load avatar for ${entity.fullName}:`, entity.avatar);
    setImageError(true);
    setImageLoaded(false);
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  // Show avatar image if available
  if (hasAvatar) {
    // Check if avatar is already a full URL (preview) or needs to be constructed
    const avatarUrl = entity.avatar!.startsWith('blob:') || entity.avatar!.startsWith('http')
      ? entity.avatar!
      : avatarService.getAvatarUrl(entity.avatar!);


    return (
      <div
        className={useTailwind ? `${sizeClasses} rounded-full overflow-hidden border-2 border-gray-300 ${className}` : className}
        style={useTailwind ? { cursor: isClickable ? 'pointer' : 'default' } : baseStyles}
        onClick={handleClick}
        title={entity.fullName}
      >
        {/* Loading overlay */}
        {!imageLoaded && !imageError && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: '#e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%'
            }}
          >
            <div style={{ fontSize: '12px', color: '#6b7280' }}>...</div>
          </div>
        )}

        <img
          src={avatarUrl}
          alt={`${entity.fullName} avatar`}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      </div>
    );
  }


  // Show fallback if no avatar or image failed to load
  if (showFallback) {
    const fallbackIcon = avatarService.getFallbackIcon(entityType);

    return (
      <div
        className={useTailwind ? `${sizeClasses} rounded-full bg-gray-100 border-2 border-gray-300 flex items-center justify-center ${className}` : className}
        style={useTailwind ? { cursor: isClickable ? 'pointer' : 'default' } : baseStyles}
        onClick={handleClick}
        title={`${entity.fullName} - No avatar`}
      >
        <span
          style={{
            fontSize: size === 'small' ? '16px' : size === 'medium' ? '20px' : '32px',
            color: '#9ca3af'
          }}
        >
          {fallbackIcon}
        </span>
      </div>
    );
  }

  // Return null if no fallback should be shown
  return null;
};
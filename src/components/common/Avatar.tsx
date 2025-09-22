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
  const [isPreloading, setIsPreloading] = useState(false);

  // Reset states when entity changes and preload image
  React.useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
    setIsPreloading(false);

    // Preload image to reduce layout shift
    if (avatarService.hasAvatar(entity)) {
      const avatarUrl = entity.avatar!.startsWith('blob:') || entity.avatar!.startsWith('http')
        ? entity.avatar!
        : avatarService.getAvatarUrl(entity.avatar!);

      setIsPreloading(true);
      const img = new Image();
      img.onload = () => {
        setIsPreloading(false);
        setImageLoaded(true);
      };
      img.onerror = () => {
        setIsPreloading(false);
        setImageError(true);
      };
      img.src = avatarUrl;
    }
  }, [entity.avatar, entity]);

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
    // Image loaded through preloading, this is just fallback
    if (!imageLoaded) {
      setImageLoaded(true);
    }
  };

  const handleImageError = () => {
    console.warn(`Failed to load avatar for ${entity.fullName}:`, entity.avatar);
    if (!imageError) {
      setImageError(true);
      setImageLoaded(false);
    }
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

    // Ensure consistent container styles with position relative for overlay
    const containerClasses = useTailwind
      ? `relative ${sizeClasses} rounded-full overflow-hidden border-2 border-gray-300 ${className}`
      : className;

    const containerStyles = useTailwind
      ? {
          cursor: isClickable ? 'pointer' : 'default',
          position: 'relative' as const
        }
      : {
          ...baseStyles,
          position: 'relative' as const
        };

    return (
      <div
        className={containerClasses}
        style={containerStyles}
        onClick={handleClick}
        title={entity.fullName}
      >
        {/* Loading placeholder with exact same size - prevents layout shift */}
        {(isPreloading || (!imageLoaded && !imageError)) && (
          <div
            className={useTailwind ? 'absolute inset-0 bg-gray-200 rounded-full flex items-center justify-center animate-pulse' : ''}
            style={useTailwind ? {} : {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: '#e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }}
          >
            <span
              className={useTailwind ? 'text-xs text-gray-400 select-none' : ''}
              style={useTailwind ? {} : {
                fontSize: size === 'small' ? '8px' : size === 'medium' ? '10px' : '12px',
                color: '#9ca3af',
                userSelect: 'none'
              }}
            >
              ●●●
            </span>
          </div>
        )}

        <img
          src={avatarUrl}
          alt={`${entity.fullName} avatar`}
          className={useTailwind ? 'w-full h-full object-cover transition-opacity duration-200' : ''}
          style={useTailwind ? {
            opacity: imageLoaded ? 1 : 0,
            position: 'absolute',
            top: 0,
            left: 0
          } : {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: imageLoaded ? 1 : 0,
            position: 'absolute',
            top: 0,
            left: 0,
            transition: 'opacity 200ms ease-in-out'
          }}
          loading="lazy"
          decoding="async"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      </div>
    );
  }


  // Show fallback if no avatar or image failed to load
  if (showFallback) {
    const fallbackIcon = avatarService.getFallbackIcon(entityType);

    // Consistent fallback sizing
    const fallbackClasses = useTailwind
      ? `${sizeClasses} rounded-full bg-gray-100 border-2 border-gray-300 flex items-center justify-center ${className}`
      : className;

    const fallbackStyles = useTailwind
      ? { cursor: isClickable ? 'pointer' : 'default' }
      : baseStyles;

    // Responsive icon sizing based on avatar size
    const iconSizes = {
      small: useTailwind ? 'text-sm' : '14px',
      medium: useTailwind ? 'text-base' : '16px',
      large: useTailwind ? 'text-2xl' : '24px'
    };

    const iconStyle = useTailwind ? {} : {
      fontSize: iconSizes[size],
      color: '#9ca3af',
      lineHeight: '1'
    };

    return (
      <div
        className={fallbackClasses}
        style={fallbackStyles}
        onClick={handleClick}
        title={`${entity.fullName} - No avatar`}
      >
        <span
          className={useTailwind ? `${iconSizes[size]} text-gray-400` : ''}
          style={iconStyle}
        >
          {fallbackIcon}
        </span>
      </div>
    );
  }

  // Return null if no fallback should be shown
  return null;
};
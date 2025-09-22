/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 22/9/2024
 */

import { API_URL } from '../constants';

export interface AvatarEntity {
  _id: string;
  avatar: string | null;
  fullName: string;
}

export type AvatarSize = 'small' | 'medium' | 'large';

export class AvatarService {
  private static instance: AvatarService;

  public static getInstance(): AvatarService {
    if (!AvatarService.instance) {
      AvatarService.instance = new AvatarService();
    }
    return AvatarService.instance;
  }

  /**
   * Get avatar URL from file ID
   * @param fileId - The file ID stored in the avatar field
   * @returns The complete URL for displaying the avatar
   */
  getAvatarUrl(fileId: string): string {
    return `${API_URL}/api/files/serve/${fileId}`;
  }

  /**
   * Validate avatar file before upload
   * @param file - The file to validate
   * @returns Validation result with error message if invalid
   */
  validateAvatarFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 2 * 1024 * 1024; // 2MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'Avatar file size must be less than 2MB'
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Only JPEG, PNG, and WebP images are allowed for avatars'
      };
    }

    return { valid: true };
  }

  /**
   * Create avatar preview URL from file
   * @param file - The file to create preview for
   * @returns Object URL for preview
   */
  createPreviewUrl(file: File): string {
    return URL.createObjectURL(file);
  }

  /**
   * Cleanup preview URL to prevent memory leaks
   * @param url - The object URL to cleanup
   */
  cleanupPreviewUrl(url: string): void {
    URL.revokeObjectURL(url);
  }

  /**
   * Check if entity has avatar
   * @param entity - Entity with avatar field
   * @returns True if entity has avatar
   */
  hasAvatar(entity: AvatarEntity): boolean {
    return Boolean(entity.avatar && entity.avatar.trim().length > 0);
  }

  /**
   * Get fallback icon for entity type
   * @param entityType - Type of entity (user, client, etc.)
   * @returns Emoji or icon for fallback
   */
  getFallbackIcon(entityType: string): string {
    const fallbacks: Record<string, string> = {
      user: '👤',
      client: '👥',
      company: '🏢',
      default: '👤'
    };

    return fallbacks[entityType] || fallbacks.default;
  }

  /**
   * Get CSS classes for avatar size
   * @param size - Avatar size variant
   * @returns CSS classes for the size
   */
  getSizeClasses(size: AvatarSize): string {
    const sizeClasses: Record<AvatarSize, string> = {
      small: 'w-8 h-8',
      medium: 'w-12 h-12',
      large: 'w-24 h-24'
    };

    return sizeClasses[size];
  }

  /**
   * Get inline styles for avatar size (for non-Tailwind environments)
   * @param size - Avatar size variant
   * @returns Inline styles object
   */
  getSizeStyles(size: AvatarSize): React.CSSProperties {
    const sizeStyles: Record<AvatarSize, React.CSSProperties> = {
      small: { width: '32px', height: '32px' },
      medium: { width: '48px', height: '48px' },
      large: { width: '96px', height: '96px' }
    };

    return sizeStyles[size];
  }
}

export const avatarService = AvatarService.getInstance();
/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 22/9/2024
 */

import React from 'react';
import { AvatarUpload } from '../../../components/common/AvatarUpload';
import type { AvatarEntity } from '../../../services/AvatarService';

interface ClientAvatarUploadProps {
  onAvatarSelected?: (file: File | null) => void;
  currentAvatarUrl?: string | null;
  entity?: AvatarEntity; // For update mode with existing client data
  className?: string;
  disabled?: boolean;
}

export const ClientAvatarUpload: React.FC<ClientAvatarUploadProps> = ({
  onAvatarSelected,
  currentAvatarUrl,
  entity,
  className = '',
  disabled = false
}) => {
  // Create entity for upload component
  const uploadEntity: AvatarEntity | undefined = entity || (currentAvatarUrl ? {
    _id: 'temp',
    avatar: currentAvatarUrl,
    fullName: 'Client'
  } : undefined);

  return (
    <AvatarUpload
      entity={uploadEntity}
      entityType="client"
      onAvatarSelected={onAvatarSelected}
      disabled={disabled}
      className={className}
      useTailwind={true}
      size="large"
    />
  );
};
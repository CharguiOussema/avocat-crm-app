/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 22/9/2024
 */

import React from 'react';
import { Avatar } from '../common/Avatar';
import type { AvatarSize } from '../../services/AvatarService';

interface ClientAvatarDisplayProps {
  client: {
    _id: string;
    avatar: string | null;
    fullName: string;
  };
  size?: AvatarSize;
  className?: string;
  showFallback?: boolean;
  onClick?: () => void;
}

export const ClientAvatarDisplay: React.FC<ClientAvatarDisplayProps> = ({
  client,
  size = 'medium',
  className = '',
  showFallback = true,
  onClick
}) => {
  return (
    <Avatar
      entity={client}
      entityType="client"
      size={size}
      className={className}
      showFallback={showFallback}
      onClick={onClick}
      useTailwind={true}
    />
  );
};
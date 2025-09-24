/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 22/9/2024
 */

import React, { useState } from 'react';
import { Avatar } from './Avatar';
import { AvatarModal } from './AvatarModal';
import type { AvatarEntity, AvatarSize } from '../../services/AvatarService';

interface AvatarWithModalProps {
  entity: AvatarEntity;
  entityType: string;
  size?: AvatarSize;
  className?: string;
  style?: React.CSSProperties;
  showFallback?: boolean;
  useTailwind?: boolean;
  showModal?: boolean; // Whether to show modal on click
  showDownload?: boolean; // Whether to show download in modal
  showZoom?: boolean; // Whether to show zoom controls in modal
  onCustomClick?: () => void; // Custom click handler (overrides modal)
}

export const AvatarWithModal: React.FC<AvatarWithModalProps> = ({
  entity,
  entityType,
  size = 'medium',
  className = '',
  style = {},
  showFallback = true,
  useTailwind = true,
  showModal = true,
  showDownload = true,
  showZoom = true,
  onCustomClick,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAvatarClick = () => {
    if (onCustomClick) {
      onCustomClick();
    } else if (showModal && entity.avatar) {
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Avatar
        entity={entity}
        entityType={entityType}
        size={size}
        className={className}
        style={style}
        showFallback={showFallback}
        useTailwind={useTailwind}
        onClick={handleAvatarClick}
      />

      {/* Avatar Modal */}
      {showModal && entity.avatar && (
        <AvatarModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          entity={entity}
          showDownload={showDownload}
          showZoom={showZoom}
        />
      )}
    </>
  );
};
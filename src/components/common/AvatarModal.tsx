/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 22/9/2024
 */

import { Dialog, Transition } from '@headlessui/react';
import React, { Fragment, useRef, useState } from 'react';
import { X, Download, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { cn } from '../../utils/cn';
import useKeyDown from '../../hooks/useKeyDown';
import useOnClickOutside from '../../hooks/useOnClickOutside';
import { useApp } from '../../hooks';
import type { AvatarEntity } from '../../services/AvatarService';

export interface AvatarModalProps {
  /**
   * Modal visibility state
   */
  isOpen: boolean;

  /**
   * Callback when modal is closed
   */
  onClose: () => void;

  /**
   * Avatar entity to display
   */
  entity: AvatarEntity;

  /**
   * Avatar URL if different from entity.avatar
   */
  avatarUrl?: string;

  /**
   * Whether to show download button
   */
  showDownload?: boolean;

  /**
   * Whether to show zoom controls
   */
  showZoom?: boolean;

  /**
   * Custom CSS class name
   */
  className?: string;

  /**
   * Data test id for testing
   */
  'data-testid'?: string;
}

/**
 * Z-Index Hierarchy: z-[200] - Highest level for full-screen image viewing
 */
export const AvatarModal: React.FC<AvatarModalProps> = ({
  isOpen,
  onClose,
  entity,
  avatarUrl,
  showDownload = true,
  showZoom = true,
  className,
  'data-testid': dataTestId,
}) => {
  const { t } = useTranslation();
  const { isRTL } = useApp();
  const refDialog = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useKeyDown('Escape', onClose);
  useOnClickOutside(refDialog, onClose);

  // Reset zoom and image states when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setZoomLevel(1);
      setImageLoaded(false);
      setImageError(false);
    }
  }, [isOpen]);

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleDownload = () => {
    const imageUrl = avatarUrl || entity.avatar;
    if (!imageUrl) return;

    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${entity.fullName}-avatar.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };

  const imageUrl = avatarUrl || entity.avatar;

  if (!imageUrl) {
    return null;
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        initialFocus={refDialog}
        as="div"
        className="fixed inset-0 z-[200] overflow-hidden"
        onClose={onClose}
        data-testid={dataTestId}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-90" />
        </Transition.Child>

        <Dialog.Panel className="min-h-screen flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 bg-black/20 backdrop-blur-sm">
            <div className={cn(
              "flex items-center min-w-0 flex-1",
              isRTL ? "space-x-reverse space-x-3" : "space-x-3"
            )}>
              <div className="min-w-0 flex-1">
                <Dialog.Title
                  as="h3"
                  className={cn(
                    "text-base sm:text-lg font-semibold text-white truncate",
                    isRTL ? "text-right" : "text-left"
                  )}
                >
                  {entity.fullName}
                </Dialog.Title>
                <p className={cn(
                  "text-xs sm:text-sm text-white/70 mt-1",
                  isRTL ? "text-right" : "text-left"
                )}>
                  {t('avatar.modal.viewImage', 'View Avatar')}
                </p>
              </div>
            </div>

            <div className={cn(
              "flex items-center flex-shrink-0",
              isRTL ? "space-x-reverse space-x-2" : "space-x-2"
            )}>
              {/* Zoom Controls */}
              {showZoom && imageLoaded && !imageError && (
                <>
                  <Button
                    type="text"
                    size="small"
                    onClick={handleZoomOut}
                    disabled={zoomLevel <= 0.5}
                    className="text-white hover:bg-white/10 border-white/20"
                    icon={<ZoomOut className="w-4 h-4" />}
                    aria-label={t('avatar.modal.zoomOut', 'Zoom out')}
                  />
                  <span className="text-white text-sm font-mono min-w-[3rem] text-center">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <Button
                    type="text"
                    size="small"
                    onClick={handleZoomIn}
                    disabled={zoomLevel >= 3}
                    className="text-white hover:bg-white/10 border-white/20"
                    icon={<ZoomIn className="w-4 h-4" />}
                    aria-label={t('avatar.modal.zoomIn', 'Zoom in')}
                  />
                </>
              )}

              {/* Download Button */}
              {showDownload && imageLoaded && !imageError && (
                <Button
                  type="text"
                  size="small"
                  onClick={handleDownload}
                  className="text-white hover:bg-white/10 border-white/20"
                  icon={<Download className="w-4 h-4" />}
                  aria-label={t('avatar.modal.download', 'Download image')}
                />
              )}

              {/* Close Button */}
              <Button
                type="text"
                size="small"
                onClick={onClose}
                className="text-white hover:bg-white/10 border-white/20"
                icon={<X className="w-4 h-4" />}
                aria-label={t('ui.close', 'Close')}
              />
            </div>
          </div>

          {/* Content */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className={cn(
              "flex-1 flex items-center p-4 sm:p-6 overflow-auto",
              isRTL ? "justify-end pr-8" : "justify-center"
            )}>
              <div
                ref={refDialog}
                className={cn(
                  "relative max-w-full max-h-full flex items-center",
                  isRTL ? "justify-end" : "justify-center",
                  className
                )}
              >
                {/* Loading State */}
                {!imageLoaded && !imageError && (
                  <div className={cn(
                    "flex flex-col space-y-4 text-white",
                    isRTL ? "items-end" : "items-center"
                  )}>
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                    <p className={cn(
                      "text-sm",
                      isRTL ? "text-right" : "text-center"
                    )}>
                      {t('avatar.modal.loading', 'Loading image...')}
                    </p>
                  </div>
                )}

                {/* Error State */}
                {imageError && (
                  <div className={cn(
                    "flex flex-col space-y-4 text-white",
                    isRTL ? "items-end" : "items-center"
                  )}>
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                      <X className="w-8 h-8" />
                    </div>
                    <div className={cn(
                      isRTL ? "text-right" : "text-center"
                    )}>
                      <p className="text-lg font-medium">
                        {t('avatar.modal.error.title', 'Failed to load image')}
                      </p>
                      <p className="text-sm text-white/70 mt-1">
                        {t('avatar.modal.error.description', 'The image could not be displayed.')}
                      </p>
                    </div>
                  </div>
                )}

                {/* Image */}
                <img
                  src={imageUrl}
                  alt={`${entity.fullName} avatar`}
                  className={cn(
                    "max-w-full max-h-full object-contain transition-all duration-200",
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  )}
                  style={{
                    transform: `scale(${zoomLevel})`,
                    maxWidth: '90vw',
                    maxHeight: '70vh',
                  }}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  draggable={false}
                />
              </div>
            </div>
          </Transition.Child>

          {/* Footer Instructions */}
          {imageLoaded && !imageError && (
            <div className="p-4 sm:p-6 bg-black/20 backdrop-blur-sm">
              <div className={cn(
                "flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 text-white/70 text-xs sm:text-sm",
                isRTL ? "sm:space-x-reverse sm:space-x-6" : "sm:space-x-6"
              )}>
                <span>{t('avatar.modal.instructions.esc', 'Press ESC to close')}</span>
                {showZoom && (
                  <span>{t('avatar.modal.instructions.zoom', 'Use zoom controls to resize')}</span>
                )}
                <span>{t('avatar.modal.instructions.click', 'Click outside to close')}</span>
              </div>
            </div>
          )}
        </Dialog.Panel>
      </Dialog>
    </Transition>
  );
};
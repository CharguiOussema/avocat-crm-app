import React, { useState, useEffect } from 'react';
import { Modal, Spin, message, Button, Space } from 'antd';
import { DownloadOutlined, ZoomInOutlined, ZoomOutOutlined, RotateRightOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { fileService } from '../../services/FileService';
import { isImageFile, isPreviewSupported } from '../../utils/file.utils';
import type { FileModelType } from '../../models/file';

interface FilePreviewDialogProps {
  open: boolean;
  onClose: () => void;
  file: FileModelType | null;
}

export const FilePreviewDialog: React.FC<FilePreviewDialogProps> = ({
  open,
  onClose,
  file,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (open && file) {
      loadPreview();
    }

    return () => {
      // Cleanup object URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [open, file]);

  const loadPreview = async () => {
    if (!file) return;

    // Check if file supports preview
    if (!isPreviewSupported(file.originalName)) {
      message.warning(t('files.previewNotSupported', 'Preview not supported for this file type'));
      return;
    }

    try {
      setLoading(true);

      // Download file as blob
      const blob = await fileService.downloadFile(file.fileName);

      // Create object URL
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (error) {
      console.error('Preview error:', error);
      message.error(t('files.previewError', 'Failed to load preview'));
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!file) return;

    try {
      const blob = await fileService.downloadFile(file.fileName);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.originalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      message.success(t('files.downloadSuccess', 'File downloaded successfully'));
    } catch (error) {
      console.error('Download error:', error);
      message.error(t('files.downloadError', 'Failed to download file'));
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const resetView = () => {
    setZoom(100);
    setRotation(0);
  };

  const renderPreview = () => {
    if (!file || !previewUrl) return null;

    const isImage = isImageFile(file.originalName);
    const isPDF = file.originalName.toLowerCase().endsWith('.pdf');

    if (isImage) {
      return (
        <div className="preview-container" style={{
          textAlign: 'center',
          overflow: 'auto',
          maxHeight: '70vh',
          padding: '20px'
        }}>
          <img
            src={previewUrl}
            alt={file.originalName}
            style={{
              maxWidth: '100%',
              maxHeight: '70vh',
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              transition: 'transform 0.3s ease',
            }}
          />
        </div>
      );
    }

    if (isPDF) {
      return (
        <div className="preview-container" style={{
          height: '70vh',
          width: '100%'
        }}>
          <iframe
            src={previewUrl}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
            }}
            title={file.originalName}
          />
        </div>
      );
    }

    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p>{t('files.previewNotSupported', 'Preview not supported for this file type')}</p>
      </div>
    );
  };

  const isImage = file && isImageFile(file.originalName);

  return (
    <Modal
      title={file?.originalName || t('files.preview', 'Preview')}
      open={open}
      onCancel={onClose}
      footer={[
        <Space key="actions">
          {isImage && (
            <>
              <Button icon={<ZoomOutOutlined />} onClick={handleZoomOut}>
                {t('common.zoomOut', 'Zoom Out')}
              </Button>
              <Button icon={<ZoomInOutlined />} onClick={handleZoomIn}>
                {t('common.zoomIn', 'Zoom In')}
              </Button>
              <Button icon={<RotateRightOutlined />} onClick={handleRotate}>
                {t('common.rotate', 'Rotate')}
              </Button>
              <Button onClick={resetView}>
                {t('common.reset', 'Reset')}
              </Button>
            </>
          )}
          <Button icon={<DownloadOutlined />} onClick={handleDownload}>
            {t('common.download', 'Download')}
          </Button>
          <Button onClick={onClose}>
            {t('common.close', 'Close')}
          </Button>
        </Space>
      ]}
      width={900}
      centered
      destroyOnClose
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <Spin size="large" />
          <p style={{ marginTop: '20px' }}>{t('common.loading', 'Loading...')}</p>
        </div>
      ) : (
        renderPreview()
      )}
    </Modal>
  );
};

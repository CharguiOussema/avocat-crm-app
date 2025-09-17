import React from 'react';
import { Typography, Card, Table, Button, Space, Tag, Upload } from 'antd';
import { DownloadOutlined, DeleteOutlined, UploadOutlined, FileOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Title } = Typography;

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  case: string;
}

export const Documents: React.FC = () => {
  const { t } = useTranslation();

  const mockDocuments: Document[] = [
    { id: '1', name: 'Contract.pdf', type: 'PDF', size: '2.4 MB', uploadedBy: 'John Doe', uploadedAt: '2024-01-15', case: 'Contract Dispute' },
    { id: '2', name: 'Evidence.docx', type: 'Word', size: '1.8 MB', uploadedBy: 'Jane Smith', uploadedAt: '2024-01-20', case: 'Property Settlement' },
    { id: '3', name: 'Medical Report.pdf', type: 'PDF', size: '3.2 MB', uploadedBy: 'Bob Johnson', uploadedAt: '2024-01-25', case: 'Personal Injury' },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'PDF': return 'red';
      case 'Word': return 'blue';
      case 'Excel': return 'green';
      default: return 'gray';
    }
  };

  const columns = [
    {
      title: t('documents.name'),
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <Space>
          <FileOutlined />
          {name}
        </Space>
      ),
    },
    {
      title: t('documents.type'),
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={getTypeColor(type)}>
          {type}
        </Tag>
      ),
    },
    {
      title: t('documents.size'),
      dataIndex: 'size',
      key: 'size',
    },
    {
      title: t('documents.case'),
      dataIndex: 'case',
      key: 'case',
    },
    {
      title: t('documents.uploadedBy'),
      dataIndex: 'uploadedBy',
      key: 'uploadedBy',
    },
    {
      title: t('documents.uploadedAt'),
      dataIndex: 'uploadedAt',
      key: 'uploadedAt',
    },
    {
      title: t('ui.actions'),
      key: 'actions',
      render: () => (
        <Space>
          <Button icon={<DownloadOutlined />} size="small" />
          <Button icon={<DeleteOutlined />} size="small" danger />
        </Space>
      ),
    },
  ];

  const uploadProps = {
    name: 'file',
    multiple: true,
    showUploadList: false,
    beforeUpload: () => false, // Prevent automatic upload
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0 }}>
          {t('navigation.documents')}
        </Title>
        <Upload {...uploadProps}>
          <Button type="primary" icon={<UploadOutlined />}>
            {t('documents.upload')}
          </Button>
        </Upload>
      </div>

      <Card>
        <Table
          dataSource={mockDocuments}
          columns={columns}
          rowKey="id"
          pagination={{
            total: mockDocuments.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
        />
      </Card>
    </div>
  );
};
import React from 'react';
import { Typography, Card, Table, Button, Space, Tag, Progress } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Title } = Typography;

interface Case {
  id: string;
  title: string;
  client: string;
  status: 'open' | 'in-progress' | 'closed';
  priority: 'low' | 'medium' | 'high';
  progress: number;
  createdAt: string;
}

export const Cases: React.FC = () => {
  const { t } = useTranslation();

  const mockCases: Case[] = [
    { id: '1', title: 'Contract Dispute', client: 'John Doe', status: 'in-progress', priority: 'high', progress: 65, createdAt: '2024-01-15' },
    { id: '2', title: 'Property Settlement', client: 'Jane Smith', status: 'open', priority: 'medium', progress: 25, createdAt: '2024-02-01' },
    { id: '3', title: 'Personal Injury', client: 'Bob Johnson', status: 'closed', priority: 'low', progress: 100, createdAt: '2023-12-10' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'blue';
      case 'in-progress': return 'orange';
      case 'closed': return 'green';
      default: return 'gray';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  const columns = [
    {
      title: t('cases.title'),
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: t('cases.client'),
      dataIndex: 'client',
      key: 'client',
    },
    {
      title: t('cases.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status.toUpperCase().replace('-', ' ')}
        </Tag>
      ),
    },
    {
      title: t('cases.priority'),
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => (
        <Tag color={getPriorityColor(priority)}>
          {priority.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: t('cases.progress'),
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number) => (
        <Progress percent={progress} size="small" />
      ),
    },
    {
      title: t('cases.created'),
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: t('ui.actions'),
      key: 'actions',
      render: () => (
        <Space>
          <Button icon={<EyeOutlined />} size="small" />
          <Button icon={<EditOutlined />} size="small" />
          <Button icon={<DeleteOutlined />} size="small" danger />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0 }}>
          {t('navigation.cases')}
        </Title>
        <Button type="primary" icon={<PlusOutlined />}>
          {t('cases.add')}
        </Button>
      </div>

      <Card>
        <Table
          dataSource={mockCases}
          columns={columns}
          rowKey="id"
          pagination={{
            total: mockCases.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
        />
      </Card>
    </div>
  );
};
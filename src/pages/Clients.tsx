import React from 'react';
import { Typography, Card, Table, Button, Space, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Title } = Typography;

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  cases: number;
}

export const Clients: React.FC = () => {
  const { t } = useTranslation();

  const mockClients: Client[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com', phone: '+1234567890', status: 'active', cases: 3 },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '+1234567891', status: 'active', cases: 1 },
    { id: '3', name: 'Bob Johnson', email: 'bob@example.com', phone: '+1234567892', status: 'inactive', cases: 0 },
  ];

  const columns = [
    {
      title: t('clients.name'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('clients.email'),
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: t('clients.phone'),
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: t('clients.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: t('clients.cases'),
      dataIndex: 'cases',
      key: 'cases',
    },
    {
      title: t('ui.actions'),
      key: 'actions',
      render: () => (
        <Space>
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
          {t('navigation.clients')}
        </Title>
        <Button type="primary" icon={<PlusOutlined />}>
          {t('clients.add')}
        </Button>
      </div>

      <Card>
        <Table
          dataSource={mockClients}
          columns={columns}
          rowKey="id"
          pagination={{
            total: mockClients.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
        />
      </Card>
    </div>
  );
};
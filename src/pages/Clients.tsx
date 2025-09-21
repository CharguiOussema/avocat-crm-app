import React from 'react';
import { Typography, Card, Table, Button, Space, Tag, Alert, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useFetchClients } from '../hooks/useFetchClients';
// import { useAuth } from '../contexts/AuthContext';

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
  // Authentication context available if needed
  // const { user } = useAuth();

  // !example of fetch list of data
  const { response } = useFetchClients();
  const { data: paginatedClients, isLoading, error } = response;

  // Extract clients from paginated response
  const clients = paginatedClients?.docs || [];

  // Mock data as fallback when API is not available
  const mockClients: Client[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com', phone: '+1234567890', status: 'active', cases: 3 },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '+1234567891', status: 'active', cases: 1 },
    { id: '3', name: 'Bob Johnson', email: 'bob@example.com', phone: '+1234567892', status: 'inactive', cases: 0 },
  ];

  // Use API data if available, otherwise use mock data
  const clientsData = clients.length > 0 ? clients : mockClients;

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
      render: (_: unknown, record: Client) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => {
              // Handle edit functionality
              console.log('Edit client:', record.id);
            }}
          />
          <Button
            icon={<DeleteOutlined />}
            size="small"
            danger
            onClick={() => {
              // Handle delete functionality
              console.log('Delete client:', record.id);
            }}
          />
        </Space>
      ),
    },
  ];

  // Handle delete client - TODO: Implement proper deletion
  // const handleDeleteClient = async (clientId: string) => {
  //   try {
  //     await clientService.delete(clientId);
  //     // Refresh data after deletion
  //   } catch (error) {
  //     console.error('Failed to delete client:', error);
  //   }
  // };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

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

      {error && (
        <Alert
          message={t('error.fetchFailed', 'Failed to fetch data')}
          description={error.message}
          type="error"
          closable
          style={{ marginBottom: '16px' }}
        />
      )}

      <Card>
        <Table
          dataSource={clientsData}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          pagination={{
            total: clientsData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
        />
      </Card>
    </div>
  );
};
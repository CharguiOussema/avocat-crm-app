import React from 'react';
import { Typography, Card, Table, Button, Space, Alert, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useFetchClients } from '../hooks/useFetchClients';
import { ClientItemResponseType } from '../models/client';
import { USER_ROLES } from '../models/consts';
// import { useAuth } from '../contexts/AuthContext';

const { Title } = Typography;

export const Clients: React.FC = () => {
  const { t } = useTranslation();
  // Authentication context available if needed
  // const { user } = useAuth();

  // !example of fetch list of data
  const { response } = useFetchClients();
  const { data: paginatedClients, isLoading, error } = response;

  // Extract clients from paginated response
  const clients = paginatedClients?.data?.docs || [];

  // Mock data as fallback when API is not available
  const mockClients: ClientItemResponseType[] = [
    {
      _id: '1',
      fullName: 'John Doe',
      email: 'john@example.com',
      phoneNumber: '+1234567890',
      cin: '12345678',
      avatar: '',
      location: 'Tunis',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: {
        _id: '1',
        fullName: 'Admin',
        email: 'admin@example.com',
        avatar: '',
        phoneNumber: '',
        cin: '',
        roles: [USER_ROLES.USER_ADMIN],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: ''
      }
    },
    {
      _id: '2',
      fullName: 'Jane Smith',
      email: 'jane@example.com',
      phoneNumber: '+1234567891',
      cin: '12345679',
      avatar: '',
      location: 'Sfax',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: {
        _id: '1',
        fullName: 'Admin',
        email: 'admin@example.com',
        avatar: '',
        phoneNumber: '',
        cin: '',
        roles: [USER_ROLES.USER_ADMIN],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: ''
      }
    }
  ];

  // Use API data if available, otherwise use mock data
  const clientsData = clients.length > 0 ? clients : mockClients;

  const columns = [
    {
      title: t('clients.name'),
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: t('clients.email'),
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: t('clients.phone'),
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
    },
    {
      title: t('clients.location'),
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: t('ui.actions'),
      key: 'actions',
      render: (_: unknown, record: ClientItemResponseType) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => {
              // Handle edit functionality
              console.log('Edit client:', record._id);
            }}
          />
          <Button
            icon={<DeleteOutlined />}
            size="small"
            danger
            onClick={() => {
              // Handle delete functionality
              console.log('Delete client:', record._id);
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

      {!!error && (
        <Alert
          message={t('error.fetchFailed', 'Failed to fetch data')}
          description={(error as Error)?.message || 'Unknown error occurred'}
          type="error"
          closable
          style={{ marginBottom: '16px' }}
        />
      )}

      <Card>
        <Table
          dataSource={clientsData}
          columns={columns}
          rowKey="_id"
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
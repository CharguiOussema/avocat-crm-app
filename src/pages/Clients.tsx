import React, { useState } from 'react';
import { Typography, Card, Table, Button, Space, Alert, Spin, Modal, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useFetchClients } from '../hooks/useFetchClients';
import { ClientItemResponseType } from '../models/client';
import { USER_ROLES } from '../models/consts';
import { ClientAvatarDisplay } from '../components/client';
import { ClientFormSimple } from '../components/client/ClientFormSimple';
import { clientService } from '../services/ClientService';
// import { useAuth } from '../contexts/AuthContext';

const { Title } = Typography;

interface ModalState {
  isOpen: boolean;
  mode: 'create' | 'update';
  client?: ClientItemResponseType;
}

export const Clients: React.FC = () => {
  const { t } = useTranslation();
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    mode: 'create'
  });
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
      avatar: null,
      location: 'Tunis',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: {
        _id: '1',
        fullName: 'Admin',
        email: 'admin@example.com',
        avatar: null,
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
      avatar: null,
      location: 'Sfax',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: {
        _id: '1',
        fullName: 'Admin',
        email: 'admin@example.com',
        avatar: null,
        phoneNumber: '',
        cin: '',
        roles: [USER_ROLES.USER_ADMIN],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: ''
      }
    },
    {
      _id: '3',
      fullName: 'Test Client With Avatar',
      email: 'test@example.com',
      phoneNumber: '+1234567892',
      cin: '12345670',
      avatar: null,
      location: 'Test City',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: {
        _id: '1',
        fullName: 'Admin',
        email: 'admin@example.com',
        avatar: null,
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

  const handleAddClient = () => {
    setModalState({
      isOpen: true,
      mode: 'create'
    });
  };

  const handleEditClient = (client: ClientItemResponseType) => {
    setModalState({
      isOpen: true,
      mode: 'update',
      client
    });
  };

  const handleDeleteClient = async (client: ClientItemResponseType) => {
    Modal.confirm({
      title: 'Delete Client',
      content: `Are you sure you want to delete ${client.fullName}?`,
      okText: 'Yes, Delete',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await clientService.delete(client._id);
          message.success(`${client.fullName} has been deleted successfully`);
          // Note: Page will need manual refresh or implement refetch
        } catch (error) {
          message.error('Failed to delete client');
          console.error('Delete error:', error);
        }
      },
    });
  };

  const handleFormSuccess = () => {
    setModalState({ isOpen: false, mode: 'create' });
    // Note: Page will need manual refresh or implement refetch
  };

  const handleModalClose = () => {
    setModalState({ isOpen: false, mode: 'create' });
  };

  const columns = [
    {
      title: t('clients.name'),
      dataIndex: 'fullName',
      key: 'fullName',
      render: (_: string, record: ClientItemResponseType) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ClientAvatarDisplay
            client={record}
            size="medium"
          />
          <span>{record.fullName}</span>
        </div>
      ),
    },
    {
      title: t('clients.email'),
      dataIndex: 'email',
      key: 'email',
      render: (email: string) => email || '-',
    },
    {
      title: t('clients.phone'),
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      render: (phone: string) => phone || '-',
    },
    {
      title: t('clients.location'),
      dataIndex: 'location',
      key: 'location',
      render: (location: string) => location || '-',
    },
    {
      title: t('ui.actions'),
      key: 'actions',
      render: (_: unknown, record: ClientItemResponseType) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEditClient(record)}
          />
          <Button
            icon={<DeleteOutlined />}
            size="small"
            danger
            onClick={() => handleDeleteClient(record)}
          />
        </Space>
      ),
    },
  ];

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
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddClient}>
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

      {/* Client Form Modal */}
      <Modal
        title={modalState.mode === 'create' ? 'Add New Client' : 'Update Client'}
        open={modalState.isOpen}
        onCancel={handleModalClose}
        footer={null}
        width={600}
        destroyOnClose
      >
        <ClientFormSimple
          mode={modalState.mode}
          client={modalState.client}
          onSuccess={handleFormSuccess}
          onCancel={handleModalClose}
        />
      </Modal>
    </div>
  );
};
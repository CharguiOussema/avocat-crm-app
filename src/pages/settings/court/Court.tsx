import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  message,
  Typography,
  Popconfirm,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  HomeOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from 'react-query';
import { courtService } from '../../../services/CourtService';
import { queryKeys } from '../../../services/QueryClientManager';
import { useApp } from '../../../hooks';
import { usePagination } from '../../../hooks/usePagination';
import {
  CourtModelType,
  CreateCourtBodyRequest,
  UpdateCourtBodyRequest,
} from '../../../models/court';
import { cn } from '../../../utils/cn';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { Search } = Input;

interface CourtFormValues {
  name: string;
}

export const Court: React.FC = () => {
  const { t } = useTranslation();
  const { isRTL } = useApp();
  const queryClient = useQueryClient();
  const [form] = Form.useForm<CourtFormValues>();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCourt, setEditingCourt] = useState<CourtModelType | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const { pagination, handleTableChange, setPagination } = usePagination(1, 10);

  // Fetch courts data
  const {
    data: courtsData,
    isLoading,
  } = useQuery(
    [queryKeys.COURTS, pagination.current, pagination.pageSize, searchText],
    () =>
      courtService.getAll({
        page: pagination.current,
        limit: pagination.pageSize,
        search: searchText || undefined,
      }),
    {
      keepPreviousData: true,
    }
  );

  // Handle search
  const handleSearch = (value: string) => {
    setSearchText(value);
    setPagination({ ...pagination, current: 1 });
  };

  // Open modal for create
  const handleCreate = () => {
    setEditingCourt(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // Open modal for edit
  const handleEdit = (court: CourtModelType) => {
    setEditingCourt(court);
    form.setFieldsValue({
      name: court.name,
    });
    setIsModalVisible(true);
  };

  // Handle modal submit
  const handleSubmit = async (values: CourtFormValues) => {
    setModalLoading(true);

    try {
      if (editingCourt) {
        // Update existing court
        const updateData: UpdateCourtBodyRequest = {
          _id: editingCourt._id,
          name: values.name.trim(),
        };
        await courtService.update(updateData);
        message.success(t('settings.court.updateSuccess'));
      } else {
        // Create new court
        const createData: CreateCourtBodyRequest = {
          name: values.name.trim(),
        };
        await courtService.create(createData);
        message.success(t('settings.court.createSuccess'));
      }

      // Refresh data
      queryClient.invalidateQueries(queryKeys.COURTS);

      // Close modal
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Error saving court:', error);
      message.error(
        editingCourt
          ? t('settings.court.updateError')
          : t('settings.court.createError')
      );
    } finally {
      setModalLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (court: CourtModelType) => {
    try {
      await courtService.delete(court._id);
      message.success(t('settings.court.deleteSuccess'));
      queryClient.invalidateQueries(queryKeys.COURTS);
    } catch (error) {
      console.error('Error deleting court:', error);
      message.error(t('settings.court.deleteError'));
    }
  };

  // Table columns
  const columns: ColumnsType<CourtModelType> = [
    {
      title: t('settings.court.table.name'),
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      render: (text: string) => (
        <Text strong className="text-card-foreground">
          {text}
        </Text>
      ),
    },
    {
      title: t('settings.court.table.createdAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 200,
      render: (date: string) => (
        <Text className="text-muted-foreground">
          {new Date(date).toLocaleDateString()}
        </Text>
      ),
    },
    {
      title: t('settings.court.table.actions'),
      key: 'actions',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title={t('ui.edit')}>
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              className="text-blue-600 hover:text-blue-700"
            />
          </Tooltip>
          <Popconfirm
            title={t('settings.court.deleteConfirm')}
            description={t('settings.court.deleteConfirmDescription', { name: record.name })}
            onConfirm={() => handleDelete(record)}
            okText={t('ui.yes')}
            cancelText={t('ui.no')}
          >
            <Tooltip title={t('ui.delete')}>
              <Button
                type="text"
                icon={<DeleteOutlined />}
                className="text-red-600 hover:text-red-700"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="border-border">
        {/* Header */}
        <div className="mb-6">
          <Title level={4} className="!mb-2 text-card-foreground">
            {t('settings.court.title')}
          </Title>
          <p className="text-muted-foreground">
            {t('settings.court.subtitle')}
          </p>
        </div>

        {/* Header Actions */}
        <div className={cn(
          "flex justify-between items-center mb-6",
          isRTL ? "flex-row-reverse" : "flex-row",
          "flex-col sm:flex-row gap-4"
        )}>
          <div className={cn(
            "flex gap-4 items-center",
            isRTL ? "flex-row-reverse" : "flex-row",
            "w-full sm:w-auto"
          )}>
            <HomeOutlined className="text-xl text-primary" />
            <Title level={5} className="!mb-0 text-card-foreground">
              {t('settings.court.management')}
            </Title>
          </div>

          <Space className="w-full sm:w-auto">
            <Search
              placeholder={t('settings.court.searchPlaceholder')}
              allowClear
              onSearch={handleSearch}
              style={{ width: 300 }}
              enterButton={<SearchOutlined />}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
              size="large"
            >
              {t('settings.court.addCourt')}
            </Button>
          </Space>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={courtsData?.data.docs}
          rowKey="_id"
          loading={isLoading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: courtsData?.data.totalDocs,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              t('settings.court.table.showTotal', {
                start: range[0],
                end: range[1],
                total,
              }),
          }}
          onChange={handleTableChange}
          scroll={{ x: true }}
          className="border-border"
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={
          editingCourt
            ? t('settings.court.editCourt')
            : t('settings.court.addCourt')
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          disabled={modalLoading}
        >
          <Form.Item
            name="name"
            label={t('settings.court.form.name')}
            rules={[
              { required: true, message: t('settings.court.form.nameRequired') },
              { min: 2, message: t('settings.court.form.nameMinLength') },
            ]}
          >
            <Input
              placeholder={t('settings.court.form.namePlaceholder')}
              size="large"
            />
          </Form.Item>

          <Form.Item className="!mb-0 flex justify-end">
            <Space>
              <Button
                onClick={() => {
                  setIsModalVisible(false);
                  form.resetFields();
                }}
                disabled={modalLoading}
              >
                {t('ui.cancel')}
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={modalLoading}
              >
                {editingCourt ? t('ui.update') : t('ui.create')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
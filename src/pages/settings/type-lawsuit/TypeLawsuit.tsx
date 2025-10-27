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
  ApartmentOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from 'react-query';
import { typeLawsuitService } from '../../../services/TypeLawsuitService';
import { queryKeys } from '../../../services/QueryClientManager';
import { useApp } from '../../../hooks';
import { usePagination } from '../../../hooks/usePagination';
import {
  TypeLawsuitModelType,
  CreateTypeLawsuitBodyRequest,
  UpdateTypeLawsuitBodyRequest,
} from '../../../models/typeLawsuit';
import { cn } from '../../../utils/cn';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { Search } = Input;

interface TypeLawsuitFormValues {
  name: string;
}

export const TypeLawsuit: React.FC = () => {
  const { t } = useTranslation();
  const { isRTL } = useApp();
  const queryClient = useQueryClient();
  const [form] = Form.useForm<TypeLawsuitFormValues>();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingType, setEditingType] = useState<TypeLawsuitModelType | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const { pagination, handleTableChange, setPagination } = usePagination(1, 10);

  // Fetch type lawsuit data
  const {
    data: typesData,
    isLoading,
  } = useQuery(
    [queryKeys.TYPE_LAWSUITS, pagination.current, pagination.pageSize, searchText],
    () =>
      typeLawsuitService.getAll({
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
    setEditingType(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // Open modal for edit
  const handleEdit = (type: TypeLawsuitModelType) => {
    setEditingType(type);
    form.setFieldsValue({
      name: type.name,
    });
    setIsModalVisible(true);
  };

  // Handle modal submit
  const handleSubmit = async (values: TypeLawsuitFormValues) => {
    setModalLoading(true);

    try {
      if (editingType) {
        // Update existing type
        const updateData: UpdateTypeLawsuitBodyRequest = {
          _id: editingType._id,
          name: values.name.trim(),
        };
        await typeLawsuitService.update(updateData);
        message.success(t('settings.typeLawsuit.updateSuccess'));
      } else {
        // Create new type
        const createData: CreateTypeLawsuitBodyRequest = {
          name: values.name.trim(),
        };
        await typeLawsuitService.create(createData);
        message.success(t('settings.typeLawsuit.createSuccess'));
      }

      // Refresh data
      queryClient.invalidateQueries(queryKeys.TYPE_LAWSUITS);

      // Close modal
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Error saving type lawsuit:', error);
      message.error(
        editingType
          ? t('settings.typeLawsuit.updateError')
          : t('settings.typeLawsuit.createError')
      );
    } finally {
      setModalLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (type: TypeLawsuitModelType) => {
    try {
      await typeLawsuitService.delete(type._id);
      message.success(t('settings.typeLawsuit.deleteSuccess'));
      queryClient.invalidateQueries(queryKeys.TYPE_LAWSUITS);
    } catch (error) {
      console.error('Error deleting type lawsuit:', error);
      message.error(t('settings.typeLawsuit.deleteError'));
    }
  };

  // Table columns
  const columns: ColumnsType<TypeLawsuitModelType> = [
    {
      title: t('settings.typeLawsuit.table.name'),
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
      title: t('settings.typeLawsuit.table.createdAt'),
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
      title: t('settings.typeLawsuit.table.actions'),
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
            title={t('settings.typeLawsuit.deleteConfirm')}
            description={t('settings.typeLawsuit.deleteConfirmDescription', { name: record.name })}
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
            {t('settings.typeLawsuit.title')}
          </Title>
          <p className="text-muted-foreground">
            {t('settings.typeLawsuit.subtitle')}
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
            <ApartmentOutlined className="text-xl text-primary" />
            <Title level={4} className="!mb-0 text-card-foreground">
              {t('settings.typeLawsuit.management')}
            </Title>
          </div>

          <Space className="w-full sm:w-auto">
            <Search
              placeholder={t('settings.typeLawsuit.searchPlaceholder')}
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
              {t('settings.typeLawsuit.addType')}
            </Button>
          </Space>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={typesData?.data.docs}
          rowKey="_id"
          loading={isLoading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: typesData?.data.totalDocs,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              t('settings.typeLawsuit.table.showTotal', {
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
          editingType
            ? t('settings.typeLawsuit.editType')
            : t('settings.typeLawsuit.addType')
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
            label={t('settings.typeLawsuit.form.name')}
            rules={[
              { required: true, message: t('settings.typeLawsuit.form.nameRequired') },
              { min: 2, message: t('settings.typeLawsuit.form.nameMinLength') },
            ]}
          >
            <Input
              placeholder={t('settings.typeLawsuit.form.namePlaceholder')}
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
                {editingType ? t('ui.update') : t('ui.create')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
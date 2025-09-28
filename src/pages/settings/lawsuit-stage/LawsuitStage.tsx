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
  FileTextOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from 'react-query';
import { lawsuitStageService } from '../../../services/LawsuitStageService';
import { queryKeys } from '../../../services/QueryClientManager';
import { useApp } from '../../../hooks';
import {
  LawsuitStageModelType,
  CreateLawsuitStageBodyRequest,
  UpdateLawsuitStageBodyRequest,
} from '../../../models/lawsuitStage';
import { cn } from '../../../utils/cn';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { Search } = Input;

interface LawsuitStageFormValues {
  name: string;
}

export const LawsuitStage: React.FC = () => {
  const { t } = useTranslation();
  const { isRTL } = useApp();
  const queryClient = useQueryClient();
  const [form] = Form.useForm<LawsuitStageFormValues>();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStage, setEditingStage] = useState<LawsuitStageModelType | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  // Fetch lawsuit stages data
  const {
    data: stagesData,
    isLoading,
  } = useQuery(
    [queryKeys.LAWSUIT_STAGES, pagination.current, pagination.pageSize, searchText],
    () =>
      lawsuitStageService.getAll({
        page: pagination.current,
        limit: pagination.pageSize,
        search: searchText || undefined,
      }),
    {
      keepPreviousData: true,
    }
  );

  // Handle table pagination
  const handleTableChange = (newPagination: any) => {
    setPagination({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });
  };

  // Handle search
  const handleSearch = (value: string) => {
    setSearchText(value);
    setPagination({ ...pagination, current: 1 });
  };

  // Open modal for create
  const handleCreate = () => {
    setEditingStage(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // Open modal for edit
  const handleEdit = (stage: LawsuitStageModelType) => {
    setEditingStage(stage);
    form.setFieldsValue({
      name: stage.name,
    });
    setIsModalVisible(true);
  };

  // Handle modal submit
  const handleSubmit = async (values: LawsuitStageFormValues) => {
    setModalLoading(true);

    try {
      if (editingStage) {
        // Update existing stage
        const updateData: UpdateLawsuitStageBodyRequest = {
          _id: editingStage._id,
          name: values.name.trim(),
        };
        await lawsuitStageService.update(updateData);
        message.success(t('settings.lawsuitStage.updateSuccess'));
      } else {
        // Create new stage
        const createData: CreateLawsuitStageBodyRequest = {
          name: values.name.trim(),
        };
        await lawsuitStageService.create(createData);
        message.success(t('settings.lawsuitStage.createSuccess'));
      }

      // Refresh data
      queryClient.invalidateQueries(queryKeys.LAWSUIT_STAGES);

      // Close modal
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Error saving lawsuit stage:', error);
      message.error(
        editingStage
          ? t('settings.lawsuitStage.updateError')
          : t('settings.lawsuitStage.createError')
      );
    } finally {
      setModalLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (stage: LawsuitStageModelType) => {
    try {
      await lawsuitStageService.delete(stage._id);
      message.success(t('settings.lawsuitStage.deleteSuccess'));
      queryClient.invalidateQueries(queryKeys.LAWSUIT_STAGES);
    } catch (error) {
      console.error('Error deleting lawsuit stage:', error);
      message.error(t('settings.lawsuitStage.deleteError'));
    }
  };

  // Table columns
  const columns: ColumnsType<LawsuitStageModelType> = [
    {
      title: t('settings.lawsuitStage.table.name'),
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
      title: t('settings.lawsuitStage.table.createdAt'),
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
      title: t('settings.lawsuitStage.table.actions'),
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
            title={t('settings.lawsuitStage.deleteConfirm')}
            description={t('settings.lawsuitStage.deleteConfirmDescription', { name: record.name })}
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
            {t('settings.lawsuitStage.title')}
          </Title>
          <p className="text-muted-foreground">
            {t('settings.lawsuitStage.subtitle')}
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
            <FileTextOutlined className="text-xl text-primary" />
            <Title level={5} className="!mb-0 text-card-foreground">
              {t('settings.lawsuitStage.management')}
            </Title>
          </div>

          <Space className="w-full sm:w-auto">
            <Search
              placeholder={t('settings.lawsuitStage.searchPlaceholder')}
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
              {t('settings.lawsuitStage.addStage')}
            </Button>
          </Space>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={stagesData?.data.docs}
          rowKey="_id"
          loading={isLoading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: stagesData?.data.totalDocs,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              t('settings.lawsuitStage.table.showTotal', {
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
          editingStage
            ? t('settings.lawsuitStage.editStage')
            : t('settings.lawsuitStage.addStage')
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
            label={t('settings.lawsuitStage.form.name')}
            rules={[
              { required: true, message: t('settings.lawsuitStage.form.nameRequired') },
              { min: 2, message: t('settings.lawsuitStage.form.nameMinLength') },
            ]}
          >
            <Input
              placeholder={t('settings.lawsuitStage.form.namePlaceholder')}
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
                {editingStage ? t('ui.update') : t('ui.create')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
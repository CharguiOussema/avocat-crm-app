/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 11/27/2025
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Card,
  Button,
  Space,
  Modal,
  Form,
  Input,
  message,
  Typography,
  Alert,
} from 'antd';
import {
  PlusOutlined,
  FileTextOutlined,
  SearchOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { lawsuitStageService } from '../../../services/LawsuitStageService';
import { queryKeys } from '../../../services/QueryClientManager';
import { useApp } from '../../../hooks';
import {
  LawsuitStageModelType,
  CreateLawsuitStageBodyRequest,
  UpdateLawsuitStageBodyRequest,
} from '../../../models/lawsuitStage';
import { cn } from '../../../utils/cn';
import { useInfiniteLawsuitStages } from '../../../hooks/useInfiniteLawsuitStages';
import { LawsuitStageCard } from './LawsuitStageCard';
import { LawsuitStageCardSkeleton } from './LawsuitStageCardSkeleton';
import { getErrorMessage, logError } from '../../../utils/errorHandling';

const { Title } = Typography;
const { Search } = Input;
const { confirm } = Modal;

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
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Use infinite scroll hook
  const {
    data,
    error,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteLawsuitStages({
    search: searchText,
    limit: 20,
  });

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Handle search
  const handleSearch = useCallback((value: string) => {
    setSearchText(value);
  }, []);

  // Open modal for create
  const handleCreate = useCallback(() => {
    setEditingStage(null);
    form.resetFields();
    setIsModalVisible(true);
  }, [form]);

  // Open modal for edit
  const handleEdit = useCallback((stage: LawsuitStageModelType) => {
    setEditingStage(stage);
    form.setFieldsValue({
      name: stage.name,
    });
    setIsModalVisible(true);
  }, [form]);

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
      logError(error, 'Error saving lawsuit stage');
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
  const handleDelete = useCallback((stage: LawsuitStageModelType) => {
    confirm({
      title: t('settings.lawsuitStage.deleteConfirm'),
      icon: <ExclamationCircleOutlined />,
      content: t('settings.lawsuitStage.deleteConfirmDescription', { name: stage.name }),
      okText: t('ui.yes'),
      cancelText: t('ui.no'),
      okType: 'danger',
      onOk: async () => {
        try {
          await lawsuitStageService.delete(stage._id);
          message.success(t('settings.lawsuitStage.deleteSuccess'));
          queryClient.invalidateQueries(queryKeys.LAWSUIT_STAGES);
        } catch (error) {
          logError(error, 'Error deleting lawsuit stage');
          message.error(t('settings.lawsuitStage.deleteError'));
        }
      },
    });
  }, [t, queryClient]);

  // Error state
  if (error) {
    return (
      <Alert
        message={t('settings.lawsuitStage.error.title')}
        description={getErrorMessage(error, t('common.unexpectedError'))}
        type='error'
        showIcon
        className='m-4'
      />
    );
  }

  // Flatten all pages into a single array of stages
  const stages = data?.pages.flatMap((page) => page.docs) || [];
  const totalStages = data?.pages[0]?.totalDocs || 0;

  return (
    <div className="space-y-6">
      <Card className="border-border">
        {/* Header */}
        <div className="mb-6">
          <Title level={4} className="!mb-2 text-card-foreground">
            {t('settings.lawsuitStage.title')}
          </Title>
          <p className="text-muted-foreground">
            {t('settings.lawsuitStage.subtitle')} ({totalStages})
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

          <Space className="w-full sm:w-auto" wrap>
            <Search
              placeholder={t('settings.lawsuitStage.searchPlaceholder')}
              allowClear
              onSearch={handleSearch}
              style={{ width: 250 }}
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

        {/* Stages Grid */}
        <div className='min-h-[400px]'>
          {isLoading ? (
            // Initial loading skeletons
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
              {Array.from({ length: 8 }).map((_, index) => (
                <LawsuitStageCardSkeleton key={index} />
              ))}
            </div>
          ) : stages.length === 0 ? (
            // Empty state
            <Card className='border-border'>
              <div className='flex flex-col items-center justify-center py-12 text-center'>
                <div className='text-6xl mb-4 text-muted-foreground'>📋</div>
                <Title level={4} className='!mb-2 text-card-foreground'>
                  {searchText
                    ? t('settings.lawsuitStage.empty.search')
                    : t('settings.lawsuitStage.empty.title')}
                </Title>
                <p className='text-muted-foreground mb-4'>
                  {searchText
                    ? t('settings.lawsuitStage.empty.searchDescription')
                    : t('settings.lawsuitStage.empty.description')}
                </p>
                {!searchText && (
                  <Button
                    type='primary'
                    icon={<PlusOutlined />}
                    onClick={handleCreate}
                  >
                    {t('settings.lawsuitStage.addStage')}
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            <>
              {/* Responsive Grid */}
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
                {stages.map((stage) => (
                  <LawsuitStageCard
                    key={stage._id}
                    stage={stage}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>

              {/* Load more trigger */}
              <div ref={loadMoreRef} className='mt-8 text-center'>
                {isFetchingNextPage && (
                  <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4'>
                    {Array.from({ length: 4 }).map((_, index) => (
                      <LawsuitStageCardSkeleton key={`loading-${index}`} />
                    ))}
                  </div>
                )}
                {!hasNextPage && stages.length > 0 && (
                  <p className='text-muted-foreground py-4'>
                    {t('settings.lawsuitStage.pagination.endOfList')}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
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
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
  ApartmentOutlined,
  SearchOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { typeLawsuitService } from '../../../services/TypeLawsuitService';
import { queryKeys } from '../../../services/QueryClientManager';
import { useApp } from '../../../hooks';
import {
  TypeLawsuitModelType,
  CreateTypeLawsuitBodyRequest,
  UpdateTypeLawsuitBodyRequest,
} from '../../../models/typeLawsuit';
import { cn } from '../../../utils/cn';
import { useInfiniteTypeLawsuits } from '../../../hooks/useInfiniteTypeLawsuits';
import { TypeLawsuitCard } from './TypeLawsuitCard';
import { TypeLawsuitCardSkeleton } from './TypeLawsuitCardSkeleton';
import { getErrorMessage, logError } from '../../../utils/errorHandling';

const { Title } = Typography;
const { Search } = Input;
const { confirm } = Modal;

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
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Use infinite scroll hook
  const {
    data,
    error,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteTypeLawsuits({
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
    setEditingType(null);
    form.resetFields();
    setIsModalVisible(true);
  }, [form]);

  // Open modal for edit
  const handleEdit = useCallback((type: TypeLawsuitModelType) => {
    setEditingType(type);
    form.setFieldsValue({
      name: type.name,
    });
    setIsModalVisible(true);
  }, [form]);

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
      logError(error, 'Error saving type lawsuit');
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
  const handleDelete = useCallback((type: TypeLawsuitModelType) => {
    confirm({
      title: t('settings.typeLawsuit.deleteConfirm'),
      icon: <ExclamationCircleOutlined />,
      content: t('settings.typeLawsuit.deleteConfirmDescription', { name: type.name }),
      okText: t('ui.yes'),
      cancelText: t('ui.no'),
      okType: 'danger',
      onOk: async () => {
        try {
          await typeLawsuitService.delete(type._id);
          message.success(t('settings.typeLawsuit.deleteSuccess'));
          queryClient.invalidateQueries(queryKeys.TYPE_LAWSUITS);
        } catch (error) {
          logError(error, 'Error deleting type lawsuit');
          message.error(t('settings.typeLawsuit.deleteError'));
        }
      },
    });
  }, [t, queryClient]);

  // Error state
  if (error) {
    return (
      <Alert
        message={t('settings.typeLawsuit.error.title')}
        description={getErrorMessage(error, t('common.unexpectedError'))}
        type='error'
        showIcon
        className='m-4'
      />
    );
  }

  // Flatten all pages into a single array of types
  const types = data?.pages.flatMap((page) => page.docs) || [];
  const totalTypes = data?.pages[0]?.totalDocs || 0;

  return (
    <div className="space-y-6">
      <Card className="border-border">
        {/* Header */}
        <div className="mb-6">
          <Title level={4} className="!mb-2 text-card-foreground">
            {t('settings.typeLawsuit.title')}
          </Title>
          <p className="text-muted-foreground">
            {t('settings.typeLawsuit.subtitle')} ({totalTypes})
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
            <Title level={5} className="!mb-0 text-card-foreground">
              {t('settings.typeLawsuit.management')}
            </Title>
          </div>

          <Space className="w-full sm:w-auto" wrap>
            <Search
              placeholder={t('settings.typeLawsuit.searchPlaceholder')}
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
              {t('settings.typeLawsuit.addType')}
            </Button>
          </Space>
        </div>

        {/* Types Grid */}
        <div className='min-h-[400px]'>
          {isLoading ? (
            // Initial loading skeletons
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
              {Array.from({ length: 8 }).map((_, index) => (
                <TypeLawsuitCardSkeleton key={index} />
              ))}
            </div>
          ) : types.length === 0 ? (
            // Empty state
            <Card className='border-border'>
              <div className='flex flex-col items-center justify-center py-12 text-center'>
                <div className='text-6xl mb-4 text-muted-foreground'>📁</div>
                <Title level={4} className='!mb-2 text-card-foreground'>
                  {searchText
                    ? t('settings.typeLawsuit.empty.search')
                    : t('settings.typeLawsuit.empty.title')}
                </Title>
                <p className='text-muted-foreground mb-4'>
                  {searchText
                    ? t('settings.typeLawsuit.empty.searchDescription')
                    : t('settings.typeLawsuit.empty.description')}
                </p>
                {!searchText && (
                  <Button
                    type='primary'
                    icon={<PlusOutlined />}
                    onClick={handleCreate}
                  >
                    {t('settings.typeLawsuit.addType')}
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            <>
              {/* Responsive Grid */}
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
                {types.map((type) => (
                  <TypeLawsuitCard
                    key={type._id}
                    type={type}
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
                      <TypeLawsuitCardSkeleton key={`loading-${index}`} />
                    ))}
                  </div>
                )}
                {!hasNextPage && types.length > 0 && (
                  <p className='text-muted-foreground py-4'>
                    {t('settings.typeLawsuit.pagination.endOfList')}
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
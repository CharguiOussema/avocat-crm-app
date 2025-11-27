/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 11/26/2025
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
  HomeOutlined,
  SearchOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { courtService } from '../../../services/CourtService';
import { queryKeys } from '../../../services/QueryClientManager';
import { useApp } from '../../../hooks';
import {
  CourtModelType,
  CreateCourtBodyRequest,
  UpdateCourtBodyRequest,
} from '../../../models/court';
import { cn } from '../../../utils/cn';
import { useInfiniteCourts } from '../../../hooks/useInfiniteCourts';
import { CourtCard } from './CourtCard';
import { CourtCardSkeleton } from './CourtCardSkeleton';
import { getErrorMessage, logError } from '../../../utils/errorHandling';

const { Title } = Typography;
const { Search } = Input;
const { confirm } = Modal;

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
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Use infinite scroll hook
  const {
    data,
    error,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteCourts({
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
    setEditingCourt(null);
    form.resetFields();
    setIsModalVisible(true);
  }, [form]);

  // Open modal for edit
  const handleEdit = useCallback((court: CourtModelType) => {
    setEditingCourt(court);
    form.setFieldsValue({
      name: court.name,
    });
    setIsModalVisible(true);
  }, [form]);

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
      logError(error, 'Error saving court');
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
  const handleDelete = useCallback((court: CourtModelType) => {
    confirm({
      title: t('settings.court.deleteConfirm'),
      icon: <ExclamationCircleOutlined />,
      content: t('settings.court.deleteConfirmDescription', { name: court.name }),
      okText: t('ui.yes'),
      cancelText: t('ui.no'),
      okType: 'danger',
      onOk: async () => {
        try {
          await courtService.delete(court._id);
          message.success(t('settings.court.deleteSuccess'));
          queryClient.invalidateQueries(queryKeys.COURTS);
        } catch (error) {
          logError(error, 'Error deleting court');
          message.error(t('settings.court.deleteError'));
        }
      },
    });
  }, [t, queryClient]);

  // Error state
  if (error) {
    return (
      <Alert
        message={t('settings.court.error.title')}
        description={getErrorMessage(error, t('common.unexpectedError'))}
        type='error'
        showIcon
        className='m-4'
      />
    );
  }

  // Flatten all pages into a single array of courts
  const courts = data?.pages.flatMap((page) => page.docs) || [];
  const totalCourts = data?.pages[0]?.totalDocs || 0;

  return (
    <div className="space-y-6">
      <Card className="border-border">
        {/* Header */}
        <div className="mb-6">
          <Title level={4} className="!mb-2 text-card-foreground">
            {t('settings.court.title')}
          </Title>
          <p className="text-muted-foreground">
            {t('settings.court.subtitle')} ({totalCourts})
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

          <Space className="w-full sm:w-auto" wrap>
            <Search
              placeholder={t('settings.court.searchPlaceholder')}
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
              {t('settings.court.addCourt')}
            </Button>
          </Space>
        </div>

        {/* Courts Grid */}
        <div className='min-h-[400px]'>
          {isLoading ? (
            // Initial loading skeletons
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
              {Array.from({ length: 8 }).map((_, index) => (
                <CourtCardSkeleton key={index} />
              ))}
            </div>
          ) : courts.length === 0 ? (
            // Empty state
            <Card className='border-border'>
              <div className='flex flex-col items-center justify-center py-12 text-center'>
                <div className='text-6xl mb-4 text-muted-foreground'>🏛️</div>
                <Title level={4} className='!mb-2 text-card-foreground'>
                  {searchText
                    ? t('settings.court.empty.search')
                    : t('settings.court.empty.title')}
                </Title>
                <p className='text-muted-foreground mb-4'>
                  {searchText
                    ? t('settings.court.empty.searchDescription')
                    : t('settings.court.empty.description')}
                </p>
                {!searchText && (
                  <Button
                    type='primary'
                    icon={<PlusOutlined />}
                    onClick={handleCreate}
                  >
                    {t('settings.court.addCourt')}
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            <>
              {/* Responsive Grid */}
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
                {courts.map((court) => (
                  <CourtCard
                    key={court._id}
                    court={court}
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
                      <CourtCardSkeleton key={`loading-${index}`} />
                    ))}
                  </div>
                )}
                {!hasNextPage && courts.length > 0 && (
                  <p className='text-muted-foreground py-4'>
                    {t('settings.court.pagination.endOfList')}
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

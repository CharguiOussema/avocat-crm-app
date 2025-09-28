import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  message,
  Row,
  Col,
  Typography,
} from 'antd';
import {
  SaveOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  IdcardOutlined,
  LockOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { AvatarUpload } from '../../../components/common/AvatarUpload';
import { userService } from '../../../services/UserService';
import { documentService } from '../../../services/DocumentService';
import { queryKeys } from '../../../services/QueryClientManager';
import { useApp, useAuth } from '../../../hooks';
import { UpdateUserBodyRequest } from '../../../models/user';
import { cn } from '../../../utils/cn';
import type { AvatarEntity } from '../../../services/AvatarService';

const { Title } = Typography;

interface ProfileFormValues {
  fullName: string;
  email: string;
  phoneNumber?: string;
  cin?: string;
}

interface PasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const MonProfil: React.FC = () => {
  const { t } = useTranslation();
  const { isRTL } = useApp();
  const { user: currentUser, refetchUser } = useAuth();
  const queryClient = useQueryClient();
  const [profileForm] = Form.useForm<ProfileFormValues>();
  const [passwordForm] = Form.useForm<PasswordFormValues>();

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Initialize form with current user data
  useEffect(() => {
    if (currentUser) {
      profileForm.setFieldsValue({
        fullName: currentUser.fullName,
        email: currentUser.email,
        phoneNumber: currentUser.phoneNumber || '',
        cin: currentUser.cin || '',
      });
    }
  }, [currentUser, profileForm]);

  // Handle avatar selection
  const handleAvatarSelected = (file: File | null) => {
    setAvatarFile(file);
  };

  // Get avatar entity for display
  const getAvatarEntity = (): AvatarEntity | undefined => {
    if (currentUser) {
      return {
        _id: currentUser._id,
        avatar: currentUser.avatar,
        fullName: currentUser.fullName,
      };
    }
    return undefined;
  };

  // Handle profile update
  const handleProfileSubmit = async (values: ProfileFormValues) => {
    if (!currentUser) return;

    setProfileLoading(true);

    try {
      let avatarDocumentId: string | null = null;

      // Upload avatar first if provided
      if (avatarFile) {
        const uploadResponse = await documentService.uploadDocument(avatarFile, {
          documentType: 'avatar',
          associatedEntityType: 'user',
          isPublic: true
        });
        avatarDocumentId = uploadResponse.data._id;
      }

      const updateData: UpdateUserBodyRequest = {
        _id: currentUser._id,
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        phoneNumber: values.phoneNumber?.trim() || null,
        cin: values.cin?.trim() || null,
        roles: currentUser.roles,
        password: '', // Keep current password
        avatar: avatarDocumentId || currentUser.avatar,
      };

      await userService.update(updateData);

      // Refetch current user
      refetchUser();

      // Invalidate user cache
      queryClient.invalidateQueries(queryKeys.USERS);

      message.success(t('settings.profile.updateSuccess'));

      // Reset avatar file selection
      setAvatarFile(null);
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error(t('settings.profile.updateError'));
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle password change
  const handlePasswordSubmit = async (values: PasswordFormValues) => {
    if (!currentUser) return;

    setPasswordLoading(true);

    try {
      const updateData: UpdateUserBodyRequest = {
        _id: currentUser._id,
        fullName: currentUser.fullName,
        email: currentUser.email,
        phoneNumber: currentUser.phoneNumber,
        cin: currentUser.cin,
        roles: currentUser.roles,
        password: values.newPassword,
        avatar: currentUser.avatar,
      };

      await userService.update(updateData);

      message.success(t('settings.password.changeSuccess'));
      passwordForm.resetFields();
    } catch (error) {
      console.error('Error changing password:', error);
      message.error(t('settings.password.changeError'));
    } finally {
      setPasswordLoading(false);
    }
  };

  // Password validation
  const validateConfirmPassword = (_: unknown, value: string) => {
    const newPassword = passwordForm.getFieldValue('newPassword');
    if (newPassword && value !== newPassword) {
      return Promise.reject(new Error(t('settings.password.mismatch')));
    }
    return Promise.resolve();
  };

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card className="border-border">
        <div className="mb-6">
          <Title level={4} className="!mb-2 text-card-foreground">
            {t('settings.profile.title')}
          </Title>
          <p className="text-muted-foreground">
            {t('settings.profile.subtitle')}
          </p>
        </div>

        <div className={cn(
          "flex gap-8 mb-8",
          isRTL ? "flex-row-reverse" : "flex-row",
          "flex-col lg:flex-row"
        )}>
          {/* Avatar Section */}
          <div className={cn(
            "flex flex-col gap-4",
            isRTL ? "lg:items-end" : "lg:items-start",
            "items-center lg:w-auto w-full"
          )}>
            <div className="text-center lg:text-left">
              <h4 className="text-base font-semibold text-card-foreground mb-2">
                {t('settings.profile.avatar')}
              </h4>
              <p className="text-sm text-muted-foreground">
                {t('settings.profile.avatarSubtitle')}
              </p>
            </div>
            <AvatarUpload
              entity={getAvatarEntity()}
              entityType="user"
              onAvatarSelected={handleAvatarSelected}
              disabled={profileLoading}
              size="large"
              useTailwind={true}
            />
          </div>

          {/* Form Fields */}
          <div className="flex-1">
            <Form
              form={profileForm}
              layout="vertical"
              onFinish={handleProfileSubmit}
              disabled={profileLoading}
            >
              <Row gutter={16}>
                <Col xs={24} lg={12}>
                  <Form.Item
                    name="fullName"
                    label={t('settings.profile.fullName')}
                    rules={[
                      { required: true, message: t('settings.profile.fullNameRequired') },
                      { min: 2, message: t('settings.profile.fullNameMinLength') },
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined />}
                      placeholder={t('settings.profile.fullNamePlaceholder')}
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} lg={12}>
                  <Form.Item
                    name="email"
                    label={t('settings.profile.email')}
                    rules={[
                      { required: true, message: t('settings.profile.emailRequired') },
                      { type: 'email', message: t('settings.profile.emailInvalid') },
                    ]}
                  >
                    <Input
                      prefix={<MailOutlined />}
                      placeholder={t('settings.profile.emailPlaceholder')}
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} lg={12}>
                  <Form.Item
                    name="phoneNumber"
                    label={t('settings.profile.phoneNumber')}
                    rules={[
                      {
                        pattern: /^[+]?[1-9][\d\s\-()]{6,20}$/,
                        message: t('settings.profile.phoneNumberInvalid'),
                      },
                    ]}
                  >
                    <Input
                      prefix={<PhoneOutlined />}
                      placeholder={t('settings.profile.phoneNumberPlaceholder')}
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} lg={12}>
                  <Form.Item
                    name="cin"
                    label={t('settings.profile.cin')}
                    rules={[
                      {
                        pattern: /^\d{8}$/,
                        message: t('settings.profile.cinInvalid'),
                      },
                    ]}
                  >
                    <Input
                      prefix={<IdcardOutlined />}
                      placeholder={t('settings.profile.cinPlaceholder')}
                      maxLength={8}
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item className="!mb-0">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={profileLoading}
                  icon={<SaveOutlined />}
                  size="large"
                >
                  {t('settings.profile.saveProfile')}
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </Card>

      {/* Password Change */}
      <Card className="border-border">
        <Title level={4} className="!mb-6 text-card-foreground">
          {t('settings.password.title')}
        </Title>

        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handlePasswordSubmit}
          disabled={passwordLoading}
          className="max-w-md"
        >
          <Form.Item
            name="currentPassword"
            label={t('settings.password.current')}
            rules={[
              { required: true, message: t('settings.password.currentRequired') },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder={t('settings.password.currentPlaceholder')}
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label={t('settings.password.new')}
            rules={[
              { required: true, message: t('settings.password.newRequired') },
              { min: 6, message: t('settings.password.minLength') },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder={t('settings.password.newPlaceholder')}
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label={t('settings.password.confirm')}
            dependencies={['newPassword']}
            rules={[
              { required: true, message: t('settings.password.confirmRequired') },
              { validator: validateConfirmPassword },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder={t('settings.password.confirmPlaceholder')}
              size="large"
            />
          </Form.Item>

          <Form.Item className="!mb-0">
            <Button
              type="primary"
              htmlType="submit"
              loading={passwordLoading}
              icon={<SaveOutlined />}
              size="large"
            >
              {t('settings.password.changePassword')}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};
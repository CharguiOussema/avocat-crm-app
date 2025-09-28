import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  message,
  Typography,
  Alert,
} from 'antd';
import {
  SaveOutlined,
  BankOutlined,
  MailOutlined,
  PhoneOutlined,
  GlobalOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { AvatarUpload } from '../../../components/common/AvatarUpload';
import { companyService } from '../../../services/CompanyService';
import { documentService } from '../../../services/DocumentService';
import { queryKeys } from '../../../services/QueryClientManager';
import { useApp, useAuth } from '../../../hooks';
import { USER_ROLES } from '../../../models/consts';
import { UpdateCompanyBodyRequest, CompanyItemResponseType } from '../../../models/company';
import { cn } from '../../../utils/cn';
import type { AvatarEntity } from '../../../services/AvatarService';

const { Title } = Typography;

interface CompanyFormValues {
  name: string;
  email: string;
  phoneNumber: string;
  webSite?: string;
}

export const Entreprise: React.FC = () => {
  const { t } = useTranslation();
  const { isRTL } = useApp();
  const { user: currentUser, company } = useAuth();
  const queryClient = useQueryClient();
  const [form] = Form.useForm<CompanyFormValues>();

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingCompany, setFetchingCompany] = useState(false);
  const [companyData, setCompanyData] = useState<CompanyItemResponseType | null>(null);

  // Check if user has admin role
  const isAdmin = currentUser?.roles.includes(USER_ROLES.USER_ADMIN);

  // Fetch current company data
  useEffect(() => {
    if (company?._id && isAdmin) {
      setFetchingCompany(true);
      companyService
        .getById(company._id)
        .then((response) => {
          const company = response.data;
          setCompanyData(company);

          // Pre-fill form with company data
          form.setFieldsValue({
            name: company.name,
            email: company.email,
            phoneNumber: company.phoneNumber,
            webSite: company.webSite || '',
          });
        })
        .catch((error) => {
          console.error('Error fetching company:', error);
          message.error(t('settings.company.fetchError'));
        })
        .finally(() => {
          setFetchingCompany(false);
        });
    }
  }, [company, isAdmin, form, t]);

  // Handle avatar selection
  const handleAvatarSelected = (file: File | null) => {
    setAvatarFile(file);
  };

  // Get avatar entity for display
  const getAvatarEntity = (): AvatarEntity | undefined => {
    if (companyData) {
      return {
        _id: companyData._id,
        avatar: companyData.logo,
        fullName: companyData.name,
      };
    }
    return undefined;
  };

  // Handle company update
  const handleSubmit = async (values: CompanyFormValues) => {
    if (!companyData || !isAdmin) return;

    setLoading(true);

    try {
      let logoDocumentId: string | null = null;

      // Upload logo first if provided
      if (avatarFile) {
        const uploadResponse = await documentService.uploadDocument(avatarFile, {
          documentType: 'logo',
          associatedEntityType: 'company',
          isPublic: true
        });
        logoDocumentId = uploadResponse.data._id;
      }

      const updateData: UpdateCompanyBodyRequest = {
        _id: companyData._id,
        name: values.name.trim(),
        email: values.email.trim(),
        phoneNumber: values.phoneNumber.trim(),
        webSite: values.webSite?.trim() || null,
        logo: logoDocumentId || companyData.logo,
      };

      const response = await companyService.update(updateData);

      // Update local state
      setCompanyData(response.data);

      // Invalidate company cache
      queryClient.invalidateQueries(queryKeys.COMPANIES);

      message.success(t('settings.company.updateSuccess'));

      // Reset logo file selection
      setAvatarFile(null);
    } catch (error) {
      console.error('Error updating company:', error);
      message.error(t('settings.company.updateError'));
    } finally {
      setLoading(false);
    }
  };

  // If user is not admin, show access denied message
  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <Card className="border-border">
          <div className="mb-6">
            <Title level={4} className="!mb-2 text-card-foreground">
              {t('settings.company.title')}
            </Title>
            <p className="text-muted-foreground">
              {t('settings.company.subtitle')}
            </p>
          </div>

          <Alert
            message={t('settings.company.accessDenied')}
            description={t('settings.company.accessDeniedDescription')}
            type="warning"
            icon={<ExclamationCircleOutlined />}
            showIcon
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-border" loading={fetchingCompany}>
        <div className="mb-6">
          <Title level={4} className="!mb-2 text-card-foreground">
            {t('settings.company.title')}
          </Title>
          <p className="text-muted-foreground">
            {t('settings.company.subtitle')}
          </p>
        </div>

        <div className={cn(
          "flex gap-8 mb-8",
          isRTL ? "flex-row-reverse" : "flex-row",
          "flex-col lg:flex-row"
        )}>
          {/* Logo Section */}
          <div className={cn(
            "flex flex-col gap-4",
            isRTL ? "lg:items-end" : "lg:items-start",
            "items-center lg:w-auto w-full"
          )}>
            <div className="text-center lg:text-left">
              <h4 className="text-base font-semibold text-card-foreground mb-2">
                {t('settings.company.logo')}
              </h4>
              <p className="text-sm text-muted-foreground">
                {t('settings.company.logoSubtitle')}
              </p>
            </div>
            <AvatarUpload
              entity={getAvatarEntity()}
              entityType="company"
              onAvatarSelected={handleAvatarSelected}
              disabled={loading}
              size="large"
              useTailwind={true}
            />
          </div>

          {/* Form Fields */}
          <div className="flex-1">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              disabled={loading}
            >
              <Form.Item
                name="name"
                label={t('settings.company.name')}
                rules={[
                  { required: true, message: t('settings.company.nameRequired') },
                  { min: 2, message: t('settings.company.nameMinLength') },
                ]}
              >
                <Input
                  prefix={<BankOutlined />}
                  placeholder={t('settings.company.namePlaceholder')}
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="email"
                label={t('settings.company.email')}
                rules={[
                  { required: true, message: t('settings.company.emailRequired') },
                  { type: 'email', message: t('settings.company.emailInvalid') },
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder={t('settings.company.emailPlaceholder')}
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="phoneNumber"
                label={t('settings.company.phoneNumber')}
                rules={[
                  { required: true, message: t('settings.company.phoneNumberRequired') },
                  {
                    pattern: /^[+]?[1-9][\d\s\-()]{6,20}$/,
                    message: t('settings.company.phoneNumberInvalid'),
                  },
                ]}
              >
                <Input
                  prefix={<PhoneOutlined />}
                  placeholder={t('settings.company.phoneNumberPlaceholder')}
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="webSite"
                label={t('settings.company.website')}
                rules={[
                  {
                    type: 'url',
                    message: t('settings.company.websiteInvalid'),
                  },
                ]}
              >
                <Input
                  prefix={<GlobalOutlined />}
                  placeholder={t('settings.company.websitePlaceholder')}
                  size="large"
                />
              </Form.Item>

              <Form.Item className="!mb-0">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<SaveOutlined />}
                  size="large"
                >
                  {t('settings.company.saveCompany')}
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </Card>
    </div>
  );
};
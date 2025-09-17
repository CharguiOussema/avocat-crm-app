import React from 'react';
import { Typography, Card, Form, Input, Select, Switch, Button, Divider, Row, Col } from 'antd';
import { SaveOutlined, UserOutlined, SettingOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useApp } from '../contexts/AppContext';

const { Title } = Typography;
const { Option } = Select;

export const Settings: React.FC = () => {
  const { t } = useTranslation();
  const { theme, setTheme, language, setLanguage } = useApp();

  const [form] = Form.useForm();

  const onFinish = (values: Record<string, unknown>) => {
    console.log('Settings saved:', values);
    // Handle settings save
  };

  return (
    <div>
      <Title level={2} style={{ marginBottom: '24px' }}>
        {t('navigation.settings')}
      </Title>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card title={<><UserOutlined /> {t('settings.profile')}</>}>
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              initialValues={{
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@law.com',
                phone: '+1234567890',
                firm: 'Doe & Associates',
                license: 'BAR123456',
              }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label={t('settings.firstName')}
                    name="firstName"
                    rules={[{ required: true, message: t('settings.firstNameRequired') }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={t('settings.lastName')}
                    name="lastName"
                    rules={[{ required: true, message: t('settings.lastNameRequired') }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label={t('settings.email')}
                name="email"
                rules={[
                  { required: true, message: t('settings.emailRequired') },
                  { type: 'email', message: t('settings.emailInvalid') }
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label={t('settings.phone')}
                name="phone"
              >
                <Input />
              </Form.Item>

              <Form.Item
                label={t('settings.firm')}
                name="firm"
              >
                <Input />
              </Form.Item>

              <Form.Item
                label={t('settings.license')}
                name="license"
              >
                <Input />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                  {t('settings.saveProfile')}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title={<><SettingOutlined /> {t('settings.preferences')}</>}>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ marginBottom: '8px' }}>
                <strong>{t('ui.theme')}</strong>
              </div>
              <Select
                style={{ width: '100%' }}
                value={theme}
                onChange={setTheme}
              >
                <Option value="light">{t('themes.light')}</Option>
                <Option value="dark">{t('themes.dark')}</Option>
                <Option value="blue">{t('themes.blue')}</Option>
                <Option value="green">{t('themes.green')}</Option>
                <Option value="purple">{t('themes.purple')}</Option>
              </Select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ marginBottom: '8px' }}>
                <strong>{t('ui.language')}</strong>
              </div>
              <Select
                style={{ width: '100%' }}
                value={language}
                onChange={setLanguage}
              >
                <Option value="en">{t('languages.en')}</Option>
                <Option value="fr">{t('languages.fr')}</Option>
                <Option value="ar">{t('languages.ar')}</Option>
              </Select>
            </div>

            <Divider />

            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span><strong>{t('settings.notifications')}</strong></span>
                <Switch defaultChecked />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span><strong>{t('settings.emailNotifications')}</strong></span>
                <Switch defaultChecked />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span><strong>{t('settings.autoSave')}</strong></span>
                <Switch defaultChecked />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span><strong>{t('settings.darkMode')}</strong></span>
                <Switch checked={theme === 'dark'} onChange={(checked) => setTheme(checked ? 'dark' : 'light')} />
              </div>
            </div>

            <Divider />

            <Button type="primary" icon={<SaveOutlined />} style={{ width: '100%' }}>
              {t('settings.savePreferences')}
            </Button>
          </Card>

          <Card title={t('settings.security')} style={{ marginTop: '16px' }}>
            <Form layout="vertical">
              <Form.Item
                label={t('settings.currentPassword')}
                name="currentPassword"
              >
                <Input.Password />
              </Form.Item>

              <Form.Item
                label={t('settings.newPassword')}
                name="newPassword"
              >
                <Input.Password />
              </Form.Item>

              <Form.Item
                label={t('settings.confirmPassword')}
                name="confirmPassword"
              >
                <Input.Password />
              </Form.Item>

              <Form.Item>
                <Button type="primary" style={{ width: '100%' }}>
                  {t('settings.changePassword')}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
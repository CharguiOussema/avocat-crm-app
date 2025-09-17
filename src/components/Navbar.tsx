import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout, Button, Dropdown, Space, Typography, theme } from 'antd';
import {
  MenuOutlined,
  GlobalOutlined,
  BgColorsOutlined,
  UserOutlined,
  LogoutOutlined,
  DownOutlined
} from '@ant-design/icons';
import { useApp, type Theme, type Language } from '../contexts/AppContext';

const { Header } = Layout;
const { Text } = Typography;

export const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const {
    sidebarOpen,
    setSidebarOpen,
    setTheme,
    setLanguage
  } = useApp();
  const [screenSize, setScreenSize] = useState('lg');
  const { token } = theme.useToken();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      if (width < 576) setScreenSize('xs');
      else if (width < 768) setScreenSize('sm');
      else if (width < 992) setScreenSize('md');
      else setScreenSize('lg');
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  const themes: { value: Theme; label: string; key: string }[] = [
    { key: 'light', value: 'light', label: t('themes.light') },
    { key: 'dark', value: 'dark', label: t('themes.dark') },
    { key: 'blue', value: 'blue', label: t('themes.blue') },
    { key: 'green', value: 'green', label: t('themes.green') },
    { key: 'purple', value: 'purple', label: t('themes.purple') },
  ];

  const languages: { value: Language; label: string; key: string }[] = [
    { key: 'en', value: 'en', label: t('languages.en') },
    { key: 'fr', value: 'fr', label: t('languages.fr') },
    { key: 'ar', value: 'ar', label: t('languages.ar') },
  ];

  const themeDropdownItems = {
    items: themes.map(theme => ({
      key: theme.key,
      label: theme.label,
      onClick: () => setTheme(theme.value)
    }))
  };

  const languageDropdownItems = {
    items: languages.map(lang => ({
      key: lang.key,
      label: lang.label,
      onClick: () => setLanguage(lang.value)
    }))
  };

  const profileDropdownItems = {
    items: [
      {
        key: 'logout',
        label: (
          <Space>
            <LogoutOutlined />
            {t('ui.logout')}
          </Space>
        ),
        onClick: () => {
          // Handle logout
        }
      }
    ]
  };

  return (
    <Header style={{
      padding: '0 24px',
      background: token.colorBgContainer,
      borderBottom: `1px solid ${token.colorBorder}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '64px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      zIndex: 999,
    }}>
      {/* Left Section */}
      <Space>
        <Button
          type="text"
          icon={<MenuOutlined />}
          onClick={toggleSidebar}
          aria-label={t('ui.menu')}
        />
        {screenSize !== 'xs' && screenSize !== 'sm' && (
          <Text strong style={{ fontSize: '20px' }}>
            {t('app.welcome')}
          </Text>
        )}
      </Space>

      {/* Right Section */}
      <Space>
        {/* Language Dropdown */}
        <Dropdown menu={languageDropdownItems} trigger={['click']}>
          <Button type="text">
            <Space>
              <GlobalOutlined />
              {screenSize !== 'xs' && (
                <span>{t('ui.language')}</span>
              )}
              <DownOutlined />
            </Space>
          </Button>
        </Dropdown>

        {/* Theme Dropdown */}
        <Dropdown menu={themeDropdownItems} trigger={['click']}>
          <Button type="text">
            <Space>
              <BgColorsOutlined />
              {screenSize !== 'xs' && (
                <span>{t('ui.theme')}</span>
              )}
              <DownOutlined />
            </Space>
          </Button>
        </Dropdown>

        {/* Profile Dropdown */}
        <Dropdown menu={profileDropdownItems} trigger={['click']}>
          <Button type="text">
            <Space>
              <UserOutlined />
              {screenSize !== 'xs' && (
                <span>{t('ui.profile')}</span>
              )}
              <DownOutlined />
            </Space>
          </Button>
        </Dropdown>
      </Space>
    </Header>
  );
};
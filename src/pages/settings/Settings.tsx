import React from 'react';
import { Card, Menu, Typography } from 'antd';
import {
  UserOutlined,
  BankOutlined,
  HomeOutlined,
  FileTextOutlined,
  ApartmentOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useApp, useAuth } from '../../hooks';
import { USER_ROLES } from '../../models/consts';
import { cn } from '../../utils/cn';

const { Title } = Typography;

interface SettingsMenuItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  path: string;
  roles?: USER_ROLES[];
}

export const Settings: React.FC = () => {
  const { t } = useTranslation();
  const { isRTL } = useApp();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems: SettingsMenuItem[] = [
    {
      key: 'mon-profil',
      icon: <UserOutlined />,
      label: t('settings.nav.monProfil'),
      path: '/settings/mon-profil',
    },
    {
      key: 'entreprise',
      icon: <BankOutlined />,
      label: t('settings.nav.entreprise'),
      path: '/settings/entreprise',
      roles: [USER_ROLES.USER_ADMIN],
    },
    {
      key: 'court',
      icon: <HomeOutlined />,
      label: t('settings.nav.court'),
      path: '/settings/court',
    },
    {
      key: 'lawsuit-stage',
      icon: <FileTextOutlined />,
      label: t('settings.nav.lawsuitStage'),
      path: '/settings/lawsuit-stage',
    },
    {
      key: 'type-lawsuit',
      icon: <ApartmentOutlined />,
      label: t('settings.nav.typeLawsuit'),
      path: '/settings/type-lawsuit',
    },
  ];

  // Filter menu items based on user roles
  const filteredMenuItems = menuItems.filter(item => {
    if (!item.roles) return true;
    return currentUser?.roles.some((role: USER_ROLES) => item.roles!.includes(role));
  });

  // Get current selected key from path
  const getCurrentKey = () => {
    const path = location.pathname;
    const item = menuItems.find(item => path.includes(item.key));
    return item ? item.key : 'mon-profil';
  };

  const handleMenuClick = ({ key }: { key: string }) => {
    const item = menuItems.find(item => item.key === key);
    if (item) {
      navigate(item.path);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between",
        isRTL ? "flex-row-reverse" : "flex-row"
      )}>
        <div>
          <Title level={2} className="!mb-2 text-card-foreground">
            {t('navigation.settings')}
          </Title>
          <p className="text-muted-foreground">
            {t('settings.subtitle')}
          </p>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation Sidebar */}
        <div className="lg:col-span-1">
          <Card className="border-border">
            <Menu
              mode="inline"
              selectedKeys={[getCurrentKey()]}
              onClick={handleMenuClick}
              className="border-none bg-transparent"
            >
              {filteredMenuItems.map((item) => (
                <Menu.Item
                  key={item.key}
                  icon={item.icon}
                  className="!rounded-md !mx-0 !mb-2"
                >
                  {item.label}
                </Menu.Item>
              ))}
            </Menu>
          </Card>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
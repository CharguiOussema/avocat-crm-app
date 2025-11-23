import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout, Menu, Button, theme } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../hooks';
import {
  HomeOutlined,
  UserOutlined,
  TeamOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  CalendarOutlined,
  BarChartOutlined,
  SettingOutlined,
  CloseOutlined,
  AuditOutlined,
  ClockCircleOutlined,
  DollarOutlined
} from '@ant-design/icons';

const { Sider } = Layout;

const navigationItems = [
  { key: 'dashboard', icon: HomeOutlined, href: '/', label: 'navigation.dashboard' },
  { key: 'clients', icon: UserOutlined, href: '/clients', label: 'navigation.clients' },
  { key: 'users', icon: TeamOutlined, href: '/users', label: 'navigation.users' },
  { key: 'lawsuits', icon: AuditOutlined, href: '/lawsuits', label: 'navigation.lawsuits' },
  { key: 'payments', icon: DollarOutlined, href: '/payments', label: 'navigation.payments' },
  { key: 'folders', icon: FolderOpenOutlined, href: '/folders', label: 'navigation.folders' },
  { key: 'events', icon: ClockCircleOutlined, href: '/events', label: 'navigation.events' },
  { key: 'cases', icon: FileTextOutlined, href: '/cases', label: 'navigation.cases' },
  { key: 'documents', icon: FolderOpenOutlined, href: '/documents', label: 'navigation.documents' },
  { key: 'calendar', icon: CalendarOutlined, href: '/calendar', label: 'navigation.calendar' },
  { key: 'reports', icon: BarChartOutlined, href: '/reports', label: 'navigation.reports' },
  { key: 'settings', icon: SettingOutlined, href: '/settings', label: 'navigation.settings' },
];

export const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  const { sidebarOpen, setSidebarOpen } = useApp();
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();

  const closeSidebar = useCallback(() => setSidebarOpen(false), [setSidebarOpen]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Keyboard accessibility - ESC to close sidebar
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && sidebarOpen) {
        closeSidebar();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen, closeSidebar]);

  const menuItems = navigationItems.map(item => ({
    key: item.key,
    icon: React.createElement(item.icon),
    label: t(item.label),
    onClick: () => {
      navigate(item.href);
      if (isMobile) {
        closeSidebar();
      }
    }
  }));

  // Get current selected key based on location
  const getCurrentKey = () => {
    const path = location.pathname;
    // Handle nested routes (like /users/add or /users/:id/edit)
    if (path.startsWith('/users')) {
      return ['users'];
    }
    if (path.startsWith('/lawsuits')) {
      return ['lawsuits'];
    }
    if (path.startsWith('/payments')) {
      return ['payments'];
    }
    if (path.startsWith('/folders')) {
      return ['folders'];
    }
    if (path.startsWith('/events')) {
      return ['events'];
    }
    const currentItem = navigationItems.find(item => item.href === path);
    return currentItem ? [currentItem.key] : ['dashboard'];
  };

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            zIndex: 999,
            display: isMobile ? 'block' : 'none'
          }}
          onClick={closeSidebar}
        />
      )}

      <Sider
        trigger={null}
        collapsible
        collapsed={!sidebarOpen}
        width={200}
        style={{
          overflow: 'hidden',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1000,
          boxShadow: '2px 0 8px rgba(0, 0, 0, 0.15)',
          background: token.colorBgContainer,
        }}
        breakpoint="md"
        collapsedWidth={0}
        onBreakpoint={(broken) => {
          if (broken) {
            setSidebarOpen(false);
          }
        }}
      >
      <div style={{
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        borderBottom: `1px solid ${token.colorBorder}`,
        background: token.colorBgContainer,
      }}>
        <h2 style={{
          margin: 0,
          fontSize: '18px',
          fontWeight: 'bold',
          color: token.colorText
        }}>
          {t('app.title')}
        </h2>
        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={closeSidebar}
          style={{
            display: sidebarOpen && isMobile ? 'block' : 'none',
            color: token.colorText
          }}
        />
      </div>

      <div style={{
        height: 'calc(100% - 64px)',
        overflowY: 'auto',
        overflowX: 'hidden',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
      className="custom-scrollbar"
      >
        <Menu
          mode="inline"
          selectedKeys={getCurrentKey()}
          style={{
            height: '100%',
            borderRight: 0,
            background: 'transparent'
          }}
          items={menuItems}
        />
      </div>
    </Sider>
    </>
  );
};
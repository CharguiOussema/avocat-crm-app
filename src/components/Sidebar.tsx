import React from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../contexts/AppContext';
import { 
  Home, 
  Users, 
  FileText, 
  FolderOpen, 
  Calendar, 
  BarChart3, 
  Settings, 
  X 
} from 'lucide-react';
import clsx from 'clsx';

const navigationItems = [
  { key: 'dashboard', icon: Home, href: '/' },
  { key: 'clients', icon: Users, href: '/clients' },
  { key: 'cases', icon: FileText, href: '/cases' },
  { key: 'documents', icon: FolderOpen, href: '/documents' },
  { key: 'calendar', icon: Calendar, href: '/calendar' },
  { key: 'reports', icon: BarChart3, href: '/reports' },
  { key: 'settings', icon: Settings, href: '/settings' },
];

export const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  const { sidebarOpen, setSidebarOpen, isRTL } = useApp();

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden sidebar-overlay"
          onClick={closeSidebar}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={clsx(
          'fixed top-0 z-50 h-full w-64 bg-card border-r border-border sidebar-transition',
          'md:relative md:translate-x-0',
          {
            'translate-x-0': sidebarOpen,
            '-translate-x-full': !sidebarOpen && !isRTL,
            'translate-x-full': !sidebarOpen && isRTL,
          },
          isRTL ? 'right-0' : 'left-0'
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            {t('app.title')}
          </h2>
          <button
            onClick={closeSidebar}
            className="md:hidden p-1 rounded-md hover:bg-accent text-foreground"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.key}
                href={item.href}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
                  'text-foreground hover:bg-accent hover:text-accent-foreground',
                  isRTL && 'flex-row-reverse'
                )}
                onClick={() => {
                  // Close sidebar on mobile when clicking a link
                  if (window.innerWidth < 768) {
                    closeSidebar();
                  }
                }}
              >
                <Icon size={20} />
                <span>{t(`navigation.${item.key}`)}</span>
              </a>
            );
          })}
        </nav>
      </div>
    </>
  );
};
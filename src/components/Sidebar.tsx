import React, { useEffect } from 'react';
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

  // Keyboard accessibility - ESC to close sidebar
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && sidebarOpen) {
        closeSidebar();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen && window.innerWidth < 1024) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  return (
    <>
      {/* Overlay for mobile and tablet */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden sidebar-overlay"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed top-0 h-full w-64 bg-card border-r border-border sidebar-transition z-50',
          // Position based on RTL
          isRTL ? 'right-0' : 'left-0',
          // Transform based on open state
          {
            'translate-x-0': sidebarOpen,
            '-translate-x-full': !sidebarOpen && !isRTL,
            'translate-x-full': !sidebarOpen && isRTL,
          }
        )}
        role="navigation"
        aria-label={t('ui.navigation')}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between header-border-alignment px-4">
          <h2 className="text-lg font-semibold text-foreground">
            {t('app.title')}
          </h2>
          <button
            onClick={closeSidebar}
            className="lg:hidden p-1 rounded-md hover:bg-accent text-foreground"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>


        {/* Navigation */}
        <nav className="p-4 space-y-2 scrollable-area">
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
                onClick={closeSidebar}
              >
                <Icon size={20} />
                <span>{t(`navigation.${item.key}`)}</span>
              </a>
            );
          })}
        </nav>
      </aside>
    </>
  );
};
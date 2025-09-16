import React from 'react';
import { useApp } from '../contexts/AppContext';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import clsx from 'clsx';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isRTL, sidebarOpen } = useApp();

  return (
    <div className={clsx('min-h-screen bg-background', isRTL && 'rtl')}>
      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className={clsx(
          'flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out',
          // Desktop margins based on sidebar state
          'lg:ml-0',
          {
            'lg:ml-64': sidebarOpen && !isRTL,
            'lg:mr-64': sidebarOpen && isRTL,
            'lg:mr-0': !sidebarOpen && isRTL,
            'lg:ml-0': !sidebarOpen && !isRTL,
          }
        )}>
          {/* Navbar */}
          <Navbar />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-6 scrollable-area">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
import React from 'react';
import { useApp } from '../contexts/AppContext';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import clsx from 'clsx';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isRTL } = useApp();

  return (
    <div className={clsx('min-h-screen bg-background', isRTL && 'rtl')}>
      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Navbar */}
          <Navbar />
          
          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
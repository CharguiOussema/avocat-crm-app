import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

export type Theme = 'light' | 'dark' | 'blue' | 'green' | 'purple';
export type Language = 'en' | 'fr' | 'ar';

interface AppContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  language: Language;
  setLanguage: (language: Language) => void;
  isRTL: boolean;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const { i18n } = useTranslation();
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) || 'light';
  });
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('language') as Language) || 'en';
  });
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    try {
      const savedState = localStorage.getItem('sidebarOpen');
      if (savedState !== null) {
        const userPreference = JSON.parse(savedState);
        const isDesktop = window.innerWidth >= 1024;
        // On desktop: use saved preference, on mobile: always start closed
        return isDesktop ? userPreference : false;
      }
      // No saved preference: open on desktop, closed on mobile
      return window.innerWidth >= 1024;
    } catch {
      // Fallback if localStorage is not available
      return window.innerWidth >= 1024;
    }
  });

  const isRTL = language === 'ar';

  // Set initial theme on mount
  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.className = theme;
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('language', language);
    i18n.changeLanguage(language);
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, isRTL, i18n]);


  // Save sidebar state to localStorage (persists across browser sessions)
  useEffect(() => {
    try {
      localStorage.setItem('sidebarOpen', JSON.stringify(sidebarOpen));
    } catch {
      // Silently fail if localStorage is not available
      console.warn('Unable to save sidebar state to localStorage');
    }
  }, [sidebarOpen]);

  useEffect(() => {
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 1024;
      // Only auto-close sidebar when resizing to mobile/tablet
      // This prevents unwanted state changes during normal usage
      if (!isDesktop && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    // Debounce resize events to prevent too many state updates
    let timeoutId: ReturnType<typeof setTimeout>;
    const debouncedHandleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 150);
    };

    window.addEventListener('resize', debouncedHandleResize);
    return () => {
      window.removeEventListener('resize', debouncedHandleResize);
      clearTimeout(timeoutId);
    };
  }, [sidebarOpen]);

  const value: AppContextType = {
    theme,
    setTheme,
    language,
    setLanguage,
    isRTL,
    sidebarOpen,
    setSidebarOpen,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
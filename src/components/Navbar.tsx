import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp, type Theme, type Language } from '../contexts/AppContext';
import { 
  Menu, 
  Globe, 
  Palette, 
  User, 
  LogOut, 
  ChevronDown 
} from 'lucide-react';
import clsx from 'clsx';

export const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const { 
    sidebarOpen, 
    setSidebarOpen, 
    theme, 
    setTheme, 
    language, 
    setLanguage, 
    isRTL 
  } = useApp();
  
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const themes: { value: Theme; label: string }[] = [
    { value: 'light', label: t('themes.light') },
    { value: 'dark', label: t('themes.dark') },
    { value: 'blue', label: t('themes.blue') },
    { value: 'green', label: t('themes.green') },
    { value: 'purple', label: t('themes.purple') },
  ];

  const languages: { value: Language; label: string }[] = [
    { value: 'en', label: t('languages.en') },
    { value: 'fr', label: t('languages.fr') },
    { value: 'ar', label: t('languages.ar') },
  ];

  return (
    <nav className="h-16 bg-card border-b border-border flex items-center justify-between px-4 relative z-30">
      {/* Left Section */}
      <div className={clsx('flex items-center gap-4', isRTL && 'flex-row-reverse')}>
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md hover:bg-accent text-foreground md:hidden"
          aria-label={t('ui.menu')}
        >
          <Menu size={20} />
        </button>
        
        <h1 className="text-xl font-semibold text-foreground hidden md:block">
          {t('app.welcome')}
        </h1>
      </div>

      {/* Right Section */}
      <div className={clsx('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
        {/* Language Dropdown */}
        <div className="relative">
          <button
            onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent text-foreground"
          >
            <Globe size={18} />
            <span className="hidden sm:block">{t('ui.language')}</span>
            <ChevronDown size={16} />
          </button>
          
          {languageDropdownOpen && (
            <div className={clsx(
              'absolute top-full mt-1 bg-popover border border-border rounded-md shadow-lg py-1 min-w-[120px] z-50',
              isRTL ? 'left-0' : 'right-0'
            )}>
              {languages.map((lang) => (
                <button
                  key={lang.value}
                  onClick={() => {
                    setLanguage(lang.value);
                    setLanguageDropdownOpen(false);
                  }}
                  className={clsx(
                    'w-full px-3 py-2 text-left hover:bg-accent text-popover-foreground',
                    language === lang.value && 'bg-accent',
                    isRTL && 'text-right'
                  )}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme Dropdown */}
        <div className="relative">
          <button
            onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent text-foreground"
          >
            <Palette size={18} />
            <span className="hidden sm:block">{t('ui.theme')}</span>
            <ChevronDown size={16} />
          </button>
          
          {themeDropdownOpen && (
            <div className={clsx(
              'absolute top-full mt-1 bg-popover border border-border rounded-md shadow-lg py-1 min-w-[120px] z-50',
              isRTL ? 'left-0' : 'right-0'
            )}>
              {themes.map((themeOption) => (
                <button
                  key={themeOption.value}
                  onClick={() => {
                    setTheme(themeOption.value);
                    setThemeDropdownOpen(false);
                  }}
                  className={clsx(
                    'w-full px-3 py-2 text-left hover:bg-accent text-popover-foreground',
                    theme === themeOption.value && 'bg-accent',
                    isRTL && 'text-right'
                  )}
                >
                  {themeOption.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent text-foreground"
          >
            <User size={18} />
            <span className="hidden sm:block">{t('ui.profile')}</span>
            <ChevronDown size={16} />
          </button>
          
          {profileDropdownOpen && (
            <div className={clsx(
              'absolute top-full mt-1 bg-popover border border-border rounded-md shadow-lg py-1 min-w-[120px] z-50',
              isRTL ? 'left-0' : 'right-0'
            )}>
              <button
                className={clsx(
                  'w-full px-3 py-2 text-left hover:bg-accent text-popover-foreground flex items-center gap-2',
                  isRTL && 'text-right flex-row-reverse'
                )}
              >
                <LogOut size={16} />
                {t('ui.logout')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(themeDropdownOpen || languageDropdownOpen || profileDropdownOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setThemeDropdownOpen(false);
            setLanguageDropdownOpen(false);
            setProfileDropdownOpen(false);
          }}
        />
      )}
    </nav>
  );
};
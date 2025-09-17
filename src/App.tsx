import { ConfigProvider, App as AntdApp, theme as antdTheme } from 'antd';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Clients } from './pages/Clients';
import { Cases } from './pages/Cases';
import { Documents } from './pages/Documents';
import { Calendar } from './pages/Calendar';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { useApp } from './contexts/AppContext';

const AppContent = () => {
  const { theme, language, isRTL } = useApp();

  const getAntdTheme = () => {
    const baseTheme = {
      token: {
        colorPrimary: theme === 'blue' ? '#1890ff' :
                     theme === 'green' ? '#52c41a' :
                     theme === 'purple' ? '#722ed1' : '#1890ff',
        borderRadius: 8,
        fontFamily: 'system-ui, -apple-system, sans-serif',
      },
    };

    if (theme === 'dark') {
      return {
        ...baseTheme,
        algorithm: antdTheme.darkAlgorithm,
        token: {
          ...baseTheme.token,
          colorBgContainer: '#141414',
          colorBgElevated: '#1f1f1f',
        },
      };
    }

    return baseTheme;
  };

  return (
    <ConfigProvider
      theme={getAntdTheme()}
      direction={isRTL ? 'rtl' : 'ltr'}
      locale={language === 'ar' ? undefined : undefined}
    >
      <AntdApp>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/cases" element={<Cases />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Layout>
        </Router>
      </AntdApp>
    </ConfigProvider>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;

import { ConfigProvider, App as AntdApp, theme as antdTheme } from 'antd';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Clients } from './pages/Clients';
import { Cases } from './pages/Cases';
import { Documents } from './pages/Documents';
import { Calendar } from './pages/Calendar';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { useApp } from './contexts/AppContext';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

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
          <Routes>
            {/* Public route - login page */}
            <Route
              path="/login"
              element={
                <ProtectedRoute requireAuth={false}>
                  <Login />
                </ProtectedRoute>
              }
            />

            {/* Protected routes - require authentication */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
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
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AntdApp>
    </ConfigProvider>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;

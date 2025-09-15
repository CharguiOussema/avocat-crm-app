import { AppProvider } from './contexts/AppContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';

function App() {
  
  return (
    <AppProvider>
      <Layout>
        <Dashboard />
      </Layout>
    </AppProvider>
  );
}

export default App;

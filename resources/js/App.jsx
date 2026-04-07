import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import { useEffect, useState } from 'react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [config, setConfig] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/status', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/config',      { credentials: 'include' }).then(r => r.json()),
    ])
      .then(([authData, configData]) => {
        setIsAuthenticated(authData.isAuthenticated ?? false);
        setConfig(configData);
      })
      .catch(() => {
        setIsAuthenticated(false);
        setConfig({});
      });
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#115948] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading portal...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <AppRoutes isAuthenticated={isAuthenticated} config={config ?? {}} />
    </Router>
  );
}

export default App;

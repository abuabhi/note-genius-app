
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/auth/AuthProvider';
import { AppProviders } from './components/app/AppProviders';
import { QueryProvider } from './components/app/QueryProvider';
import AppRoutes from './components/app/AppRoutes';

function App() {
  useEffect(() => {
    document.title = 'StudySphere';
  }, []);

  return (
    <Router>
      <QueryProvider>
        <AuthProvider>
          <AppProviders>
            <div className="App min-h-screen bg-gray-50">
              <AppRoutes />
            </div>
          </AppProviders>
        </AuthProvider>
      </QueryProvider>
    </Router>
  );
}

export default App;

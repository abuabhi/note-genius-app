
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/auth/useAuth';
import LoginPage from './pages/LoginPage';
import NotesPage from './pages/NotesPage';
import FlashcardsPage from './pages/FlashcardsPage';
import CreateFlashcardSetPage from './pages/CreateFlashcardSetPage';
import DashboardPage from './pages/DashboardPage';
import RemindersPage from './pages/RemindersPage';
import StudyPlannerPage from './pages/StudyPlannerPage';
import { AppProviders } from './components/app/AppProviders';
import { QueryProvider } from './components/app/QueryProvider';

function App() {
  const { user } = useAuth();

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    return user ? children : <Navigate to="/login" />;
  };

  useEffect(() => {
    document.title = 'StudySphere';
  }, []);

  return (
    <Router>
      <QueryProvider>
        <AppProviders>
          <div className="App min-h-screen bg-gray-50">
            <Routes>
              <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/notes" element={<ProtectedRoute><NotesPage /></ProtectedRoute>} />
              <Route path="/flashcards" element={<ProtectedRoute><FlashcardsPage /></ProtectedRoute>} />
              <Route path="/flashcards/create" element={<ProtectedRoute><CreateFlashcardSetPage /></ProtectedRoute>} />
              <Route path="/reminders" element={<ProtectedRoute><RemindersPage /></ProtectedRoute>} />
              <Route path="/study-planner" element={<ProtectedRoute><StudyPlannerPage /></ProtectedRoute>} />
              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
          </div>
        </AppProviders>
      </QueryProvider>
    </Router>
  );
}

export default App;

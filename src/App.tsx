import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import UpdatePasswordPage from './pages/UpdatePasswordPage';
import NotesPage from './pages/NotesPage';
import FlashcardsPage from './pages/FlashcardsPage';
import CreateFlashcardSetPage from './pages/CreateFlashcardSetPage';
import EditFlashcardSetPage from './pages/EditFlashcardSetPage';
import StudyFlashcardsPage from './pages/StudyFlashcardsPage';
import AccountSettingsPage from './pages/AccountSettingsPage';
import DashboardPage from './pages/DashboardPage';
import RemindersPage from './pages/RemindersPage';
import { AppProviders } from './contexts/AppProviders';
import { QueryProvider } from './components/app/QueryProvider';
import { Calendar } from "lucide-react";

import StudyPlannerPage from "@/pages/StudyPlannerPage";

function App() {
  const { currentUser } = useAuth();

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    return currentUser ? children : <Navigate to="/login" />;
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
              <Route path="/login" element={!currentUser ? <LoginPage /> : <Navigate to="/dashboard" />} />
              <Route path="/register" element={!currentUser ? <RegisterPage /> : <Navigate to="/dashboard" />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/update-password" element={<UpdatePasswordPage />} />
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/notes" element={<ProtectedRoute><NotesPage /></ProtectedRoute>} />
              <Route path="/flashcards" element={<ProtectedRoute><FlashcardsPage /></ProtectedRoute>} />
              <Route path="/flashcards/create" element={<ProtectedRoute><CreateFlashcardSetPage /></ProtectedRoute>} />
              <Route path="/flashcards/:id" element={<ProtectedRoute><EditFlashcardSetPage /></ProtectedRoute>} />
              <Route path="/flashcards/:id/study" element={<ProtectedRoute><StudyFlashcardsPage /></ProtectedRoute>} />
              <Route path="/account" element={<ProtectedRoute><AccountSettingsPage /></ProtectedRoute>} />
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

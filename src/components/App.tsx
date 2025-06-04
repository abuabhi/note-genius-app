import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/auth';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import NotesPage from '@/pages/NotesPage';
import FlashcardsPage from '@/pages/FlashcardsPage';
import FlashcardSetPage from '@/pages/FlashcardSetPage';
import EditFlashcardSetPage from '@/pages/EditFlashcardSetPage';
import CreateFlashcardPage from '@/pages/CreateFlashcardPage';
import EditFlashcardPage from '@/pages/EditFlashcardPage';
import PricingPage from '@/pages/PricingPage';
import AccountSettingsPage from '@/pages/AccountSettingsPage';
import StudyPage from '@/pages/StudyPage';
import { FlashcardProvider } from '@/contexts/FlashcardContext';

// ScrollToTop component
const ScrollToTop: React.FC = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return <>{children}</>;
};

// ProtectedRoute component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? (
    children
  ) : (
    <Navigate to="/login" replace />
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <FlashcardProvider>
          <ScrollToTop>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route
                path="/notes"
                element={
                  <ProtectedRoute>
                    <NotesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/flashcards"
                element={
                  <ProtectedRoute>
                    <FlashcardsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/flashcards/:setId"
                element={
                  <ProtectedRoute>
                    <FlashcardSetPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/flashcards/:setId/edit"
                element={
                  <ProtectedRoute>
                    <EditFlashcardSetPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/flashcards/:setId/create"
                element={
                  <ProtectedRoute>
                    <CreateFlashcardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/flashcards/:setId/card/:cardId/edit"
                element={
                  <ProtectedRoute>
                    <EditFlashcardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pricing"
                element={<PricingPage />}
              />
              <Route
                path="/account"
                element={
                  <ProtectedRoute>
                    <AccountSettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/study/:setId"
                element={
                  <ProtectedRoute>
                    <StudyPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </ScrollToTop>
        </FlashcardProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;

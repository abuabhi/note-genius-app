
import React, { useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/auth';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './queryClient';
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import PricingPage from "./pages/PricingPage";
import FAQPage from "./pages/FAQPage";
import DashboardPage from "./pages/DashboardPage";
import NotesPage from "./pages/NotesPage";
import NoteStudyPage from "./pages/NoteStudyPage";
import QuizPage from "./pages/QuizPage";
import FlashcardsPage from "./pages/FlashcardsPage";
import StudyPage from "./pages/StudyPage";
import StudySessionsPage from "./pages/StudySessionsPage";
import ProgressPage from "./pages/ProgressPage";
import SchedulePage from "./pages/SchedulePage";
import SettingsPage from "./pages/SettingsPage";
import FlashcardLibraryPage from "./pages/FlashcardLibraryPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminFlashcardPage from "./pages/AdminFlashcardPage";
import AdminSectionsPage from "./pages/AdminSectionsPage";
import AdminSubjectsPage from "./pages/AdminSubjectsPage";
import AdminGradesPage from "./pages/AdminGradesPage";
import AdminCSVImportPage from "./pages/AdminCSVImportPage";
import AdminFeaturesPage from "./pages/AdminFeaturesPage";
import CreateQuizPage from "./pages/CreateQuizPage";
import TakeQuizPage from "./pages/TakeQuizPage";
import NoteToFlashcardPage from "./pages/NoteToFlashcardPage";
import CollaborationPage from "./pages/CollaborationPage";
import NotFoundPage from "./pages/NotFoundPage";
import NotionAuthCallback from './components/auth/NotionAuthCallback';
import EvernoteAuthCallback from './components/auth/EvernoteAuthCallback';
import MicrosoftAuthCallback from './components/auth/MicrosoftAuthCallback';
import GoogleDocsAuthCallback from './components/auth/GoogleDocsAuthCallback';
import { NavigationProvider } from './contexts/NavigationContext';
import { NoteProvider } from '@/contexts/NoteContext';
import { FeatureProvider } from '@/contexts/FeatureContext';
import { FeatureProtectedRoute } from '@/components/routes/FeatureProtectedRoute';
import ChatPage from "./pages/ChatPage";
import GoalsPage from "./pages/GoalsPage";
import TodoPage from "./pages/TodoPage";
import EditNotePage from "./pages/EditNotePage";
import OnboardingPage from "@/pages/OnboardingPage";

const App = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Store current path in localStorage when path changes 
  useEffect(() => {
    if (location.pathname !== '/login' && location.pathname !== '/signup') {
      localStorage.setItem("lastVisitedPage", location.pathname);
    }
    // Always scroll to top on route change
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <QueryClientProvider client={queryClient}>
      <div>
        <NavigationProvider>
          <NoteProvider>
            <FeatureProvider>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/faq" element={<FAQPage />} />

                {/* Standard protected routes - always available */}
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/notes" element={<NotesPage />} />
                <Route path="/notes/study/:noteId" element={<NoteStudyPage />} />
                <Route path="/flashcards" element={<FlashcardsPage />} />
                <Route path="/study" element={<StudyPage />} />
                <Route path="/study/:setId" element={<StudyPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/library" element={<FlashcardLibraryPage />} />
                <Route path="/notes/edit/:noteId" element={<EditNotePage />} />

                {/* Feature-protected routes */}
                <Route
                  path="/study-sessions"
                  element={
                    <FeatureProtectedRoute featureKey="study_sessions">
                      <StudySessionsPage />
                    </FeatureProtectedRoute>
                  }
                />
                <Route
                  path="/progress"
                  element={
                    <FeatureProtectedRoute featureKey="progress">
                      <ProgressPage />
                    </FeatureProtectedRoute>
                  }
                />
                <Route
                  path="/schedule"
                  element={
                    <FeatureProtectedRoute featureKey="schedule">
                      <SchedulePage />
                    </FeatureProtectedRoute>
                  }
                />
                <Route
                  path="/goals"
                  element={
                    <FeatureProtectedRoute featureKey="goals">
                      <GoalsPage />
                    </FeatureProtectedRoute>
                  }
                />
                <Route
                  path="/todos"
                  element={
                    <FeatureProtectedRoute featureKey="todos">
                      <TodoPage />
                    </FeatureProtectedRoute>
                  }
                />
                <Route
                  path="/quizzes"
                  element={
                    <FeatureProtectedRoute featureKey="quizzes">
                      <QuizPage />
                    </FeatureProtectedRoute>
                  }
                />
                <Route
                  path="/quiz/create"
                  element={
                    <FeatureProtectedRoute featureKey="quizzes">
                      <CreateQuizPage />
                    </FeatureProtectedRoute>
                  }
                />
                <Route
                  path="/quizzes/:quizId"
                  element={
                    <FeatureProtectedRoute featureKey="quizzes">
                      <TakeQuizPage />
                    </FeatureProtectedRoute>
                  }
                />
                
                {/* Already feature protected routes */}
                <Route 
                  path="/chat" 
                  element={
                    <FeatureProtectedRoute featureKey="chat">
                      <ChatPage />
                    </FeatureProtectedRoute>
                  } 
                />
                <Route 
                  path="/collaborate" 
                  element={
                    <FeatureProtectedRoute featureKey="collaboration">
                      <CollaborationPage />
                    </FeatureProtectedRoute>
                  }
                />
                <Route 
                  path="/collaboration" 
                  element={
                    <FeatureProtectedRoute featureKey="collaboration">
                      <CollaborationPage />
                    </FeatureProtectedRoute>
                  }
                />

                {/* Admin routes */}
                <Route path="/admin/users" element={<AdminUsersPage />} />
                <Route path="/admin/flashcards" element={<AdminFlashcardPage />} />
                <Route path="/admin/sections" element={<AdminSectionsPage />} />
                <Route path="/admin/subjects" element={<AdminSubjectsPage />} />
                <Route path="/admin/grades" element={<AdminGradesPage />} />
                <Route path="/admin/csv-import" element={<AdminCSVImportPage />} />
                <Route path="/admin/features" element={<AdminFeaturesPage />} />
                
                {/* Create / conversion routes */}
                <Route path="/note-to-flashcard" element={<NoteToFlashcardPage />} />
                
                {/* Auth callback routes */}
                <Route path="/auth/notion/callback" element={<NotionAuthCallback />} />
                <Route path="/auth/evernote/callback" element={<EvernoteAuthCallback />} />
                <Route path="/auth/microsoft/callback" element={<MicrosoftAuthCallback />} />
                <Route path="/auth/googledocs/callback" element={<GoogleDocsAuthCallback />} />
                
                {/* 404 */}
                <Route path="*" element={<NotFoundPage />} />
                <Route path="/onboarding" element={<OnboardingPage />} />
              </Routes>
            </FeatureProvider>
          </NoteProvider>
        </NavigationProvider>
      </div>
    </QueryClientProvider>
  );
};

export default App;

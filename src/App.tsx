import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
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
import CreateQuizPage from "./pages/CreateQuizPage";
import TakeQuizPage from "./pages/TakeQuizPage";
import NoteToFlashcardPage from "./pages/NoteToFlashcardPage";
import CollaborationPage from "./pages/CollaborationPage";
import NotFoundPage from "./pages/NotFoundPage";
import NotionAuthCallback from './components/auth/NotionAuthCallback';
import EvernoteAuthCallback from './components/auth/EvernoteAuthCallback';
import MicrosoftAuthCallback from './components/auth/MicrosoftAuthCallback';
import GoogleDocsAuthCallback from './components/auth/GoogleDocsAuthCallback';
import { useAuth } from './contexts/AuthContext';
import { NavigationProvider } from './contexts/NavigationContext';
import { NoteProvider } from '@/contexts/NoteContext';
import ChatPage from "./pages/ChatPage";
import GoalsPage from "./pages/GoalsPage";
import TodoPage from "./pages/TodoPage";
import EditNotePage from "./pages/EditNotePage";

const App = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div>
      <NavigationProvider>
        <NoteProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/faq" element={<FAQPage />} />

            {/* Protected routes */}
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/notes/study/:noteId" element={<NoteStudyPage />} />
            <Route path="/quizzes" element={<QuizPage />} />
            <Route path="/flashcards" element={<FlashcardsPage />} />
            <Route path="/study" element={<StudyPage />} />
            <Route path="/study-sessions" element={<StudySessionsPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="/goals" element={<GoalsPage />} />
            <Route path="/todos" element={<TodoPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/library" element={<FlashcardLibraryPage />} />
            <Route path="/chat" element={<ChatPage />} />

            {/* Admin routes */}
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/flashcards" element={<AdminFlashcardPage />} />
            <Route path="/admin/sections" element={<AdminSectionsPage />} />
            <Route path="/admin/subjects" element={<AdminSubjectsPage />} />
            <Route path="/admin/grades" element={<AdminGradesPage />} />
            <Route path="/admin/csv-import" element={<AdminCSVImportPage />} />
            
            {/* Creating routes */}
            <Route path="/create-quiz" element={<CreateQuizPage />} />
            <Route path="/quizzes/:quizId" element={<TakeQuizPage />} />
            <Route path="/notes-to-flashcards" element={<NoteToFlashcardPage />} />
            
            {/* Collaboration routes */}
            <Route path="/collaboration" element={<CollaborationPage />} />
            <Route path="/collaborate" element={<CollaborationPage />} />
            
            {/* Auth callback routes */}
            <Route path="/auth/notion/callback" element={<NotionAuthCallback />} />
            <Route path="/auth/evernote/callback" element={<EvernoteAuthCallback />} />
            <Route path="/auth/microsoft/callback" element={<MicrosoftAuthCallback />} />
            <Route path="/auth/googledocs/callback" element={<GoogleDocsAuthCallback />} />
            
            {/* Add this new route for editing notes */}
            <Route path="/notes/edit/:noteId" element={<EditNotePage />} />
            
            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </NoteProvider>
      </NavigationProvider>
    </div>
  );
};

export default App;

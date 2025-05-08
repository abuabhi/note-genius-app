
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import HomePage from '@/pages/HomePage';

// Auth pages
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const SignupPage = lazy(() => import('@/pages/SignupPage'));

// Main app pages
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const NotesPage = lazy(() => import('@/pages/NotesPage'));
const FlashcardsPage = lazy(() => import('@/pages/FlashcardsPage'));
const StudySessionsPage = lazy(() => import('@/pages/StudySessionsPage'));
const ProgressPage = lazy(() => import('@/pages/ProgressPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const StudyPage = lazy(() => import('@/pages/StudyPage'));
const SchedulePage = lazy(() => import('@/pages/SchedulePage'));
const NoteToFlashcardPage = lazy(() => import('@/pages/NoteToFlashcardPage'));
const CollaborationPage = lazy(() => import('@/pages/CollaborationPage'));
const FlashcardLibraryPage = lazy(() => import('@/pages/FlashcardLibraryPage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const FAQPage = lazy(() => import('@/pages/FAQPage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));
const QuizPage = lazy(() => import('@/pages/QuizPage'));

// Admin pages
const AdminFlashcardPage = lazy(() => import('@/pages/AdminFlashcardPage'));
const AdminGradesPage = lazy(() => import('@/pages/AdminGradesPage'));
const AdminSectionsPage = lazy(() => import('@/pages/AdminSectionsPage'));
const AdminCSVImportPage = lazy(() => import('@/pages/AdminCSVImportPage'));
const AdminUsersPage = lazy(() => import('@/pages/AdminUsersPage'));

// API callbacks
const NotionAuthCallback = lazy(() => import('@/components/auth/NotionAuthCallback'));
const EvernoteAuthCallback = lazy(() => import('@/components/auth/EvernoteAuthCallback'));
const GoogleDocsAuthCallback = lazy(() => import('@/components/auth/GoogleDocsAuthCallback'));
const MicrosoftAuthCallback = lazy(() => import('@/components/auth/MicrosoftAuthCallback'));

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="study-app-theme">
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              
              {/* Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              
              {/* Main App Routes */}
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/notes" element={<NotesPage />} />
              <Route path="/flashcards" element={<FlashcardsPage />} />
              <Route path="/flashcard-library" element={<FlashcardLibraryPage />} />
              <Route path="/study-sessions" element={<StudySessionsPage />} />
              <Route path="/quiz" element={<QuizPage />} />
              <Route path="/progress" element={<ProgressPage />} />
              <Route path="/collaborate" element={<CollaborationPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/study/:setId" element={<StudyPage />} />
              <Route path="/schedule" element={<SchedulePage />} />
              <Route path="/note-to-flashcard/:noteId" element={<NoteToFlashcardPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/contact" element={<ContactPage />} />
              
              {/* Admin Routes */}
              <Route path="/admin/flashcards" element={<AdminFlashcardPage />} />
              <Route path="/admin/grades" element={<AdminGradesPage />} />
              <Route path="/admin/sections" element={<AdminSectionsPage />} />
              <Route path="/admin/csv-import" element={<AdminCSVImportPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              
              {/* API Callback Routes */}
              <Route path="/auth/notion/callback" element={<NotionAuthCallback />} />
              <Route path="/auth/evernote/callback" element={<EvernoteAuthCallback />} />
              <Route path="/auth/googledocs/callback" element={<GoogleDocsAuthCallback />} />
              <Route path="/auth/microsoft/callback" element={<MicrosoftAuthCallback />} />
              
              {/* 404 Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

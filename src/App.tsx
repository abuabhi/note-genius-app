
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { NavigationProvider } from '@/contexts/NavigationContext';
import HomePage from '@/pages/HomePage';
import PricingPage from '@/pages/PricingPage';

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
const CreateQuizPage = lazy(() => import('@/pages/CreateQuizPage'));
const TakeQuizPage = lazy(() => import('@/pages/TakeQuizPage'));

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
              <Route path="/" element={
                <NavigationProvider>
                  <HomePage />
                </NavigationProvider>
              } />
              
              {/* Auth Routes */}
              <Route path="/login" element={
                <NavigationProvider>
                  <LoginPage />
                </NavigationProvider>
              } />
              <Route path="/signup" element={
                <NavigationProvider>
                  <SignupPage />
                </NavigationProvider>
              } />
              
              {/* Public Pages */}
              <Route path="/pricing" element={
                <NavigationProvider>
                  <PricingPage />
                </NavigationProvider>
              } />
              
              {/* Main App Routes */}
              <Route path="/dashboard" element={
                <NavigationProvider>
                  <DashboardPage />
                </NavigationProvider>
              } />
              <Route path="/notes" element={
                <NavigationProvider>
                  <NotesPage />
                </NavigationProvider>
              } />
              <Route path="/flashcards" element={
                <NavigationProvider>
                  <FlashcardsPage />
                </NavigationProvider>
              } />
              <Route path="/flashcard-library" element={
                <NavigationProvider>
                  <FlashcardLibraryPage />
                </NavigationProvider>
              } />
              <Route path="/study-sessions" element={
                <NavigationProvider>
                  <StudySessionsPage />
                </NavigationProvider>
              } />
              <Route path="/quiz" element={
                <NavigationProvider>
                  <QuizPage />
                </NavigationProvider>
              } />
              <Route path="/quiz/create" element={
                <NavigationProvider>
                  <CreateQuizPage />
                </NavigationProvider>
              } />
              <Route path="/quiz/take/:quizId" element={
                <NavigationProvider>
                  <TakeQuizPage />
                </NavigationProvider>
              } />
              <Route path="/progress" element={
                <NavigationProvider>
                  <ProgressPage />
                </NavigationProvider>
              } />
              <Route path="/collaborate" element={
                <NavigationProvider>
                  <CollaborationPage />
                </NavigationProvider>
              } />
              <Route path="/settings" element={
                <NavigationProvider>
                  <SettingsPage />
                </NavigationProvider>
              } />
              <Route path="/study/:setId" element={
                <NavigationProvider>
                  <StudyPage />
                </NavigationProvider>
              } />
              <Route path="/schedule" element={
                <NavigationProvider>
                  <SchedulePage />
                </NavigationProvider>
              } />
              <Route path="/note-to-flashcard/:noteId" element={
                <NavigationProvider>
                  <NoteToFlashcardPage />
                </NavigationProvider>
              } />
              <Route path="/about" element={
                <NavigationProvider>
                  <AboutPage />
                </NavigationProvider>
              } />
              <Route path="/faq" element={
                <NavigationProvider>
                  <FAQPage />
                </NavigationProvider>
              } />
              <Route path="/contact" element={
                <NavigationProvider>
                  <ContactPage />
                </NavigationProvider>
              } />
              
              {/* Admin Routes */}
              <Route path="/admin/flashcards" element={
                <NavigationProvider>
                  <AdminFlashcardPage />
                </NavigationProvider>
              } />
              <Route path="/admin/grades" element={
                <NavigationProvider>
                  <AdminGradesPage />
                </NavigationProvider>
              } />
              <Route path="/admin/sections" element={
                <NavigationProvider>
                  <AdminSectionsPage />
                </NavigationProvider>
              } />
              <Route path="/admin/csv-import" element={
                <NavigationProvider>
                  <AdminCSVImportPage />
                </NavigationProvider>
              } />
              <Route path="/admin/users" element={
                <NavigationProvider>
                  <AdminUsersPage />
                </NavigationProvider>
              } />
              
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

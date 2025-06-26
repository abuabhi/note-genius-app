import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { LoadingState } from "@/components/notes/page/LoadingState";
import { FlashcardsErrorFallback } from "@/components/error/FlashcardsErrorFallback";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AdminRoute from "@/components/auth/AdminRoute";
import DashboardPage from "@/pages/DashboardPage";
import NotesPage from "@/pages/NotesPage";
import NotePage from "@/pages/NotePage";
import NewNotePage from "@/pages/NewNotePage";
import EditNotePage from "@/pages/EditNotePage";
import TrashPage from "@/pages/TrashPage";
import SettingsPage from "@/pages/SettingsPage";
import AccountSettingsPage from "@/pages/AccountSettingsPage";
import SecuritySettingsPage from "@/pages/SecuritySettingsPage";
import AppearanceSettingsPage from "@/pages/AppearanceSettingsPage";
import NotificationsSettingsPage from "@/pages/NotificationsSettingsPage";
import AdvancedSettingsPage from "@/pages/AdvancedSettingsPage";
import OnboardingPage from "@/pages/OnboardingPage";
import FlashcardsPage from "@/pages/FlashcardsPage";
import CreateFlashcardSetPage from "@/pages/CreateFlashcardSetPage";
import EditFlashcardSetPage from "@/pages/EditFlashcardSetPage";
import ViewFlashcardSetPage from "@/pages/ViewFlashcardSetPage";
import StudyFlashcardSetPage from "@/pages/StudyFlashcardSetPage";
import FlashcardSetsPage from "@/pages/FlashcardSetsPage";
import StudyPlannerPage from "@/pages/StudyPlannerPage";
import StudySessionsPage from "@/pages/StudySessionsPage";
import QuizPage from "@/pages/QuizPage";
import CreateQuizPage from "@/pages/CreateQuizPage";
import EditQuizPage from "@/pages/EditQuizPage";
import ViewQuizPage from "@/pages/ViewQuizPage";
import TakeQuizPage from "@/pages/TakeQuizPage";
import QuizzesPage from "@/pages/QuizzesPage";
import NoteToQuizPage from "@/pages/NoteToQuizPage";
import AdminDashboardPage from "@/pages/AdminDashboardPage";
import UsersAdminPage from "@/pages/admin/UsersAdminPage";
import NotesAdminPage from "@/pages/admin/NotesAdminPage";
import FlashcardsAdminPage from "@/pages/admin/FlashcardsAdminPage";
import AnalyticsAdminPage from "@/pages/admin/AnalyticsAdminPage";

const SuggestionsPage = lazy(() => import("@/pages/SuggestionsPage"));

export const AppRoutes = () => {
  return (
    <ErrorBoundary FallbackComponent={FlashcardsErrorFallback}>
      <Suspense fallback={<LoadingState />}>
        <Routes>
          <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />

          <Route path="/notes" element={<ProtectedRoute><NotesPage /></ProtectedRoute>} />
          <Route path="/notes/:id" element={<ProtectedRoute><NotePage /></ProtectedRoute>} />
          <Route path="/notes/new" element={<ProtectedRoute><NewNotePage /></ProtectedRoute>} />
          <Route path="/notes/:id/edit" element={<ProtectedRoute><EditNotePage /></ProtectedRoute>} />
          <Route path="/trash" element={<ProtectedRoute><TrashPage /></ProtectedRoute>} />

          <Route path="/flashcards" element={<ProtectedRoute><FlashcardsPage /></ProtectedRoute>} />
          <Route path="/flashcards/sets" element={<ProtectedRoute><FlashcardSetsPage /></ProtectedRoute>} />
          <Route path="/flashcards/create" element={<ProtectedRoute><CreateFlashcardSetPage /></ProtectedRoute>} />
          <Route path="/flashcards/edit/:id" element={<ProtectedRoute><EditFlashcardSetPage /></ProtectedRoute>} />
          <Route path="/flashcards/view/:id" element={<ProtectedRoute><ViewFlashcardSetPage /></ProtectedRoute>} />
          <Route path="/flashcards/study/:id" element={<ProtectedRoute><StudyFlashcardSetPage /></ProtectedRoute>} />

          <Route path="/study-planner" element={<ProtectedRoute><StudyPlannerPage /></ProtectedRoute>} />
          <Route path="/study-sessions" element={<ProtectedRoute><StudySessionsPage /></ProtectedRoute>} />

          <Route path="/quiz" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
          <Route path="/quiz/create" element={<ProtectedRoute><CreateQuizPage /></ProtectedRoute>} />
          <Route path="/quiz/edit/:id" element={<ProtectedRoute><EditQuizPage /></ProtectedRoute>} />
          <Route path="/quiz/view/:id" element={<ProtectedRoute><ViewQuizPage /></ProtectedRoute>} />
          <Route path="/quiz/take/:id" element={<ProtectedRoute><TakeQuizPage /></ProtectedRoute>} />
          <Route path="/quiz/all" element={<ProtectedRoute><QuizzesPage /></ProtectedRoute>} />
          <Route path="/quiz/note-to-quiz" element={<ProtectedRoute><NoteToQuizPage /></ProtectedRoute>} />

          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/settings/account" element={<ProtectedRoute><AccountSettingsPage /></ProtectedRoute>} />
          <Route path="/settings/security" element={<ProtectedRoute><SecuritySettingsPage /></ProtectedRoute>} />
          <Route path="/settings/appearance" element={<ProtectedRoute><AppearanceSettingsPage /></ProtectedRoute>} />
          <Route path="/settings/notifications" element={<ProtectedRoute><NotificationsSettingsPage /></ProtectedRoute>} />
          <Route path="/settings/advanced" element={<ProtectedRoute><AdvancedSettingsPage /></ProtectedRoute>} />

          <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><UsersAdminPage /></AdminRoute>} />
          <Route path="/admin/notes" element={<AdminRoute><NotesAdminPage /></AdminRoute>} />
          <Route path="/admin/flashcards" element={<AdminRoute><FlashcardsAdminPage /></AdminRoute>} />
          <Route path="/admin/analytics" element={<AdminRoute><AnalyticsAdminPage /></AdminRoute>} />
          
          <Route path="/suggestions" element={
            <ProtectedRoute>
              <SuggestionsPage />
            </ProtectedRoute>
          } />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

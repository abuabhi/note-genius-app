
import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { LoadingState } from "@/components/notes/page/LoadingState";
import { FlashcardsErrorFallback } from "@/components/error/FlashcardsErrorFallback";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminRoute } from "@/components/auth/AdminRoute";
import DashboardPage from "@/pages/DashboardPage";
import NotesPage from "@/pages/NotesPage";
import SettingsPage from "@/pages/SettingsPage";
import OnboardingPage from "@/pages/OnboardingPage";
import FlashcardsPage from "@/pages/FlashcardsPage";
import CreateFlashcardSetPage from "@/pages/CreateFlashcardSetPage";
import StudyPlannerPage from "@/pages/StudyPlannerPage";
import StudySessionsPage from "@/pages/StudySessionsPage";
import QuizPage from "@/pages/QuizPage";
import CreateQuizPage from "@/pages/CreateQuizPage";
import TakeQuizPage from "@/pages/TakeQuizPage";
import AdminDashboardPage from "@/pages/AdminDashboardPage";

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

          <Route path="/flashcards" element={<ProtectedRoute><FlashcardsPage /></ProtectedRoute>} />
          <Route path="/flashcards/create" element={<ProtectedRoute><CreateFlashcardSetPage /></ProtectedRoute>} />

          <Route path="/study-planner" element={<ProtectedRoute><StudyPlannerPage /></ProtectedRoute>} />
          <Route path="/study-sessions" element={<ProtectedRoute><StudySessionsPage /></ProtectedRoute>} />

          <Route path="/quiz" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
          <Route path="/quiz/create" element={<ProtectedRoute><CreateQuizPage /></ProtectedRoute>} />
          <Route path="/quiz/take/:id" element={<ProtectedRoute><TakeQuizPage /></ProtectedRoute>} />

          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

          <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
          
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

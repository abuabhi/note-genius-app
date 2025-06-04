
import React from 'react';
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import AboutPage from "@/pages/AboutPage";
import ContactPage from "@/pages/ContactPage";
import PricingPage from "@/pages/PricingPage";
import FAQPage from "@/pages/FAQPage";
import DashboardPage from "@/pages/DashboardPage";
import NotesPage from "@/pages/NotesPage";
import NoteStudyPage from "@/pages/NoteStudyPage";
import QuizPage from "@/pages/QuizPage";
import FlashcardsPage from "@/pages/FlashcardsPage";
import FlashcardSetPage from "@/pages/FlashcardSetPage";
import StudyPage from "@/pages/StudyPage";
import StudySessionsPage from "@/pages/StudySessionsPage";
import ProgressPage from "@/pages/ProgressPage";
import SchedulePage from "@/pages/SchedulePage";
import SettingsPage from "@/pages/SettingsPage";
import FlashcardLibraryPage from "@/pages/FlashcardLibraryPage";
import AdminUsersPage from "@/pages/AdminUsersPage";
import AdminFlashcardPage from "@/pages/AdminFlashcardPage";
import AdminSectionsPage from "@/pages/AdminSectionsPage";
import AdminSubjectsPage from "@/pages/AdminSubjectsPage";
import AdminGradesPage from "@/pages/AdminGradesPage";
import AdminCSVImportPage from "@/pages/AdminCSVImportPage";
import AdminFeaturesPage from "@/pages/AdminFeaturesPage";
import CreateQuizPage from "@/pages/CreateQuizPage";
import TakeQuizPage from "@/pages/TakeQuizPage";
import NoteToFlashcardPage from "@/pages/NoteToFlashcardPage";
import CollaborationPage from "@/pages/CollaborationPage";
import ConnectionsPage from "@/pages/ConnectionsPage";
import NotFoundPage from "@/pages/NotFoundPage";
import NotionAuthCallback from '@/components/auth/NotionAuthCallback';
import EvernoteAuthCallback from '@/components/auth/EvernoteAuthCallback';
import MicrosoftAuthCallback from '@/components/auth/MicrosoftAuthCallback';
import GoogleDocsAuthCallback from '@/components/auth/GoogleDocsAuthCallback';
import ChatPage from "@/pages/ChatPage";
import GoalsPage from "@/pages/GoalsPage";
import TodoPage from "@/pages/TodoPage";
import EditNotePage from "@/pages/EditNotePage";
import OnboardingPage from "@/pages/OnboardingPage";
import { FeatureProtectedRoute } from '@/components/routes/FeatureProtectedRoute';

export interface RouteConfig {
  path: string;
  element: React.ReactElement;
}

// Public routes that don't require authentication
export const publicRoutes: RouteConfig[] = [
  { path: "/", element: <HomePage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignupPage /> },
  { path: "/about", element: <AboutPage /> },
  { path: "/contact", element: <ContactPage /> },
  { path: "/pricing", element: <PricingPage /> },
  { path: "/faq", element: <FAQPage /> },
];

// Standard protected routes - always available to authenticated users
export const standardRoutes: RouteConfig[] = [
  { path: "/dashboard", element: <DashboardPage /> },
  { path: "/notes", element: <NotesPage /> },
  { path: "/notes/study/:noteId", element: <NoteStudyPage /> },
  { path: "/flashcards", element: <FlashcardsPage /> },
  { path: "/flashcards/:setId", element: <FlashcardSetPage /> },
  { path: "/study", element: <StudyPage /> },
  { path: "/study/:setId", element: <StudyPage /> },
  { path: "/settings", element: <SettingsPage /> },
  { path: "/library", element: <FlashcardLibraryPage /> },
  { path: "/notes/edit/:noteId", element: <EditNotePage /> },
];

// Feature-protected routes that require specific features to be enabled
export const featureProtectedRoutes: RouteConfig[] = [
  {
    path: "/study-sessions",
    element: (
      <FeatureProtectedRoute featureKey="study_sessions">
        <StudySessionsPage />
      </FeatureProtectedRoute>
    ),
  },
  {
    path: "/progress",
    element: (
      <FeatureProtectedRoute featureKey="progress">
        <ProgressPage />
      </FeatureProtectedRoute>
    ),
  },
  {
    path: "/schedule",
    element: (
      <FeatureProtectedRoute featureKey="schedule">
        <SchedulePage />
      </FeatureProtectedRoute>
    ),
  },
  {
    path: "/goals",
    element: (
      <FeatureProtectedRoute featureKey="goals">
        <GoalsPage />
      </FeatureProtectedRoute>
    ),
  },
  {
    path: "/todos",
    element: (
      <FeatureProtectedRoute featureKey="todos">
        <TodoPage />
      </FeatureProtectedRoute>
    ),
  },
  {
    path: "/quizzes",
    element: (
      <FeatureProtectedRoute featureKey="quizzes">
        <QuizPage />
      </FeatureProtectedRoute>
    ),
  },
  {
    path: "/quiz/create",
    element: (
      <FeatureProtectedRoute featureKey="quizzes">
        <CreateQuizPage />
      </FeatureProtectedRoute>
    ),
  },
  {
    path: "/quizzes/:quizId",
    element: (
      <FeatureProtectedRoute featureKey="quizzes">
        <TakeQuizPage />
      </FeatureProtectedRoute>
    ),
  },
  {
    path: "/chat",
    element: (
      <FeatureProtectedRoute featureKey="chat">
        <ChatPage />
      </FeatureProtectedRoute>
    ),
  },
  {
    path: "/collaboration",
    element: (
      <FeatureProtectedRoute featureKey="collaboration">
        <CollaborationPage />
      </FeatureProtectedRoute>
    ),
  },
  {
    path: "/connections",
    element: (
      <FeatureProtectedRoute featureKey="connections">
        <ConnectionsPage />
      </FeatureProtectedRoute>
    ),
  },
];

// Admin routes
export const adminRoutes: RouteConfig[] = [
  { path: "/admin/users", element: <AdminUsersPage /> },
  { path: "/admin/flashcards", element: <AdminFlashcardPage /> },
  { path: "/admin/sections", element: <AdminSectionsPage /> },
  { path: "/admin/grades", element: <AdminGradesPage /> },
  { path: "/admin/subjects", element: <AdminSubjectsPage /> },
  { path: "/admin/csv-import", element: <AdminCSVImportPage /> },
  { path: "/admin/features", element: <AdminFeaturesPage /> },
];

// Auth callback routes
export const authCallbackRoutes: RouteConfig[] = [
  { path: "/auth/notion/callback", element: <NotionAuthCallback /> },
  { path: "/auth/evernote/callback", element: <EvernoteAuthCallback /> },
  { path: "/auth/microsoft/callback", element: <MicrosoftAuthCallback /> },
  { path: "/auth/googledocs/callback", element: <GoogleDocsAuthCallback /> },
];

// Other routes
export const miscRoutes: RouteConfig[] = [
  { path: "/note-to-flashcard", element: <NoteToFlashcardPage /> },
  { path: "/onboarding", element: <OnboardingPage /> },
  { path: "*", element: <NotFoundPage /> },
];

// All routes combined
export const allRoutes: RouteConfig[] = [
  ...publicRoutes,
  ...standardRoutes,
  ...featureProtectedRoutes,
  ...adminRoutes,
  ...authCallbackRoutes,
  ...miscRoutes,
];
